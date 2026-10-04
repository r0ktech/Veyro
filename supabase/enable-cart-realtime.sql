-- =====================================================================
-- Veyro: live cart sync between the website and the mobile app.
-- Run once in Supabase → SQL Editor. Safe to re-run.
--
-- Adds cart_items to Supabase Realtime, so every signed-in device is told
-- the moment the cart changes. Row level security still applies: each user
-- only receives changes to their own cart.
-- =====================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cart_items'
  ) then
    alter publication supabase_realtime add table public.cart_items;
  end if;
end $$;
