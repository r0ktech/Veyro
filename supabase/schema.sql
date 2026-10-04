-- =====================================================================
-- Veyro — tech store schema
-- Run this whole file once in Supabase → SQL Editor → New query → Run.
-- It is idempotent for tables/policies/functions; seed data is in seed.sql.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text not null default '',
  kind        text not null,               -- visual type: laptop, phone, monitor, keyboard, mouse, headphones, charger, ssd
  sort_order  int  not null default 0
);

create table if not exists public.products (
  id               uuid primary key default gen_random_uuid(),
  category_id      uuid not null references public.categories(id) on delete restrict,
  slug             text not null unique,
  name             text not null,
  brand            text not null,
  description      text not null default '',
  price_cents      bigint not null check (price_cents >= 0),       -- all money is in kobo (₦1 = 100)
  compare_at_cents bigint          check (compare_at_cents is null or compare_at_cents >= 0),
  stock            int  not null default 0 check (stock >= 0),
  specs            jsonb not null default '{}'::jsonb,
  image_url        text,
  accent           text not null default '#6366f1',  -- colour used for the generated product visual
  featured         boolean not null default false,
  created_at       timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(featured) where featured;

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz not null default now()
);

create table if not exists public.cart_items (
  user_id     uuid not null references auth.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  quantity    int  not null check (quantity between 1 and 20),
  updated_at  timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  user_id         uuid not null references auth.users(id) on delete cascade,
  email           text not null,
  status          text not null default 'confirmed'
                  check (status in ('pending','confirmed','shipped','delivered','cancelled')),
  subtotal_cents  bigint not null,
  shipping_cents  bigint not null,
  tax_cents       bigint not null,
  total_cents     bigint not null,
  full_name       text not null,
  phone           text not null,
  address_line1   text not null,
  address_line2   text,
  city            text not null,
  state           text not null,
  postal_code     text not null,
  country         text not null,
  payment_method  text not null check (payment_method in ('pay_on_delivery','bank_transfer')),
  notes           text,
  email_sent_at   timestamptz,
  created_at      timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders(user_id, created_at desc);

create table if not exists public.order_items (
  id                uuid primary key default gen_random_uuid(),
  order_id          uuid not null references public.orders(id) on delete cascade,
  product_id        uuid references public.products(id) on delete set null,
  product_name      text not null,
  product_slug      text,
  unit_price_cents  bigint not null,
  quantity          int not null check (quantity > 0),
  line_total_cents  bigint not null
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ---------------------------------------------------------------------
-- Profile row for every new auth user (filled from Google metadata)
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.profiles    enable row level security;
alter table public.cart_items  enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "categories are public" on public.categories;
create policy "categories are public" on public.categories for select using (true);

drop policy if exists "products are public" on public.products;
create policy "products are public" on public.products for select using (true);

drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles for select using (auth.uid() = id);
drop policy if exists "own profile update" on public.profiles;
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

drop policy if exists "own cart" on public.cart_items;
create policy "own cart" on public.cart_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Orders are only ever created through place_order(); users can read their own.
drop policy if exists "own orders read" on public.orders;
create policy "own orders read" on public.orders for select using (auth.uid() = user_id);

drop policy if exists "own order items read" on public.order_items;
create policy "own order items read" on public.order_items for select using (
  exists (select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid())
);

-- ---------------------------------------------------------------------
-- Checkout: turn the signed-in user's cart into an order, atomically.
-- Prices come from the products table (never from the client), stock is
-- locked and decremented, and the cart is cleared.
-- Keep SHIPPING / TAX constants in sync with src/lib/pricing.ts.
-- ---------------------------------------------------------------------

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

-- Records that the confirmation email went out (users cannot update orders directly).
create or replace function public.mark_order_emailed(p_order_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.orders set email_sent_at = now()
  where id = p_order_id and user_id = auth.uid();
$$;

revoke all on function public.place_order(text,text,text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.place_order(text,text,text,text,text,text,text,text,text,text) to authenticated;
revoke all on function public.mark_order_emailed(uuid) from public, anon;
grant execute on function public.mark_order_emailed(uuid) to authenticated;
