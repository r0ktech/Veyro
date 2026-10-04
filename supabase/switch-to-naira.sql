-- =====================================================================
-- Veyro: switch an existing database from US dollars to naira.
-- Run once in Supabase → SQL Editor. Safe to re-run; it can run before or
-- after update-product-photos.sql.
--
-- Amounts are stored in kobo (₦1 = 100). Prices are converted at ₦1,500 to
-- $1 and rounded to the nearest ₦1,000. Existing orders are converted once,
-- at the same rate, so order history shows naira too.
-- =====================================================================

begin;

-- Naira amounts in kobo are big: widen every money column.
alter table public.products
  alter column price_cents type bigint,
  alter column compare_at_cents type bigint;
alter table public.orders
  alter column subtotal_cents type bigint,
  alter column shipping_cents type bigint,
  alter column tax_cents type bigint,
  alter column total_cents type bigint;
alter table public.order_items
  alter column unit_price_cents type bigint,
  alter column line_total_cents type bigint;

-- Products: anything under ₦10,000 (1,000,000 kobo) is still in US cents.
update public.products set price_cents = round(price_cents * 15 / 1000.0) * 100000
where price_cents < 1000000;
update public.products set compare_at_cents = round(compare_at_cents * 15 / 1000.0) * 100000
where compare_at_cents < 1000000;

-- Orders placed before the switch: convert exactly once.
create table if not exists public.app_migrations (
  name       text primary key,
  applied_at timestamptz not null default now()
);
alter table public.app_migrations enable row level security;

do $$
begin
  if not exists (select 1 from public.app_migrations where name = 'naira') then
    update public.orders set
      subtotal_cents = subtotal_cents * 1500,
      shipping_cents = shipping_cents * 1500,
      tax_cents      = tax_cents * 1500,
      total_cents    = total_cents * 1500;
    update public.order_items set
      unit_price_cents = unit_price_cents * 1500,
      line_total_cents = line_total_cents * 1500;
    insert into public.app_migrations (name) values ('naira');
  end if;
end $$;

-- Checkout function with naira shipping rules (same as schema.sql).
create or replace function public.place_order(
  p_full_name      text,
  p_phone          text,
  p_address_line1  text,
  p_address_line2  text,
  p_city           text,
  p_state          text,
  p_postal_code    text,
  p_country        text,
  p_payment_method text,
  p_notes          text
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  c_free_shipping_min constant bigint  := 50000000;  -- ₦500,000 (amounts are in kobo)
  c_shipping_fee      constant bigint  := 500000;    -- ₦5,000
  c_tax_rate          constant numeric := 0.075;  -- 7.5%

  v_user     uuid := auth.uid();
  v_email    text;
  v_order_id uuid;
  v_subtotal bigint := 0;
  v_shipping bigint;
  v_tax      bigint;
  r          record;
begin
  if v_user is null then
    raise exception 'You must be signed in to place an order';
  end if;

  select email into v_email from auth.users where id = v_user;

  for r in
    select c.quantity, p.name, p.price_cents, p.stock
    from public.cart_items c
    join public.products p on p.id = c.product_id
    where c.user_id = v_user
    for update of p
  loop
    if r.quantity > r.stock then
      raise exception 'Only % left in stock for %', r.stock, r.name;
    end if;
    v_subtotal := v_subtotal + r.price_cents * r.quantity;
  end loop;

  if v_subtotal = 0 then
    raise exception 'Your cart is empty';
  end if;

  v_shipping := case when v_subtotal >= c_free_shipping_min then 0 else c_shipping_fee end;
  v_tax      := round(v_subtotal * c_tax_rate / 100) * 100;  -- whole naira

  insert into public.orders (
    order_number, user_id, email, subtotal_cents, shipping_cents, tax_cents, total_cents,
    full_name, phone, address_line1, address_line2, city, state, postal_code, country,
    payment_method, notes
  ) values (
    'VY-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(md5(gen_random_uuid()::text), 1, 6)),
    v_user, v_email, v_subtotal, v_shipping, v_tax, v_subtotal + v_shipping + v_tax,
    p_full_name, p_phone, p_address_line1, nullif(p_address_line2, ''), p_city, p_state,
    p_postal_code, p_country, p_payment_method, nullif(p_notes, '')
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, product_id, product_name, product_slug, unit_price_cents, quantity, line_total_cents)
  select v_order_id, p.id, p.name, p.slug, p.price_cents, c.quantity, p.price_cents * c.quantity
  from public.cart_items c
  join public.products p on p.id = c.product_id
  where c.user_id = v_user;

  update public.products p
  set stock = p.stock - c.quantity
  from public.cart_items c
  where c.product_id = p.id and c.user_id = v_user;

  delete from public.cart_items where user_id = v_user;

  return v_order_id;
end;
$$;

revoke all on function public.place_order(text,text,text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.place_order(text,text,text,text,text,text,text,text,text,text) to authenticated;

commit;
