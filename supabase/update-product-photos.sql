-- =====================================================================
-- Veyro: switch an already-seeded database to real product photos.
-- Run once in Supabase → SQL Editor if you ran the original seed.sql.
-- Renames the products whose photo shows a different model, then sets
-- image_url for every product. Product ids are kept, so carts and past
-- orders are unaffected. Safe to re-run.
-- =====================================================================

begin;

update public.products set slug = 'macbook-pro-14-m5', name = 'MacBook Pro 14" (M5)', brand = 'Apple',
  description = 'The M5 chip brings a big leap in graphics and AI performance to the 14-inch MacBook Pro, with a stunning Liquid Retina XDR display.',
  price_cents = 239900000, compare_at_cents = null, stock = 12, featured = true,
  specs = '{"Chip": "Apple M5", "Memory": "16GB unified", "Storage": "512GB SSD", "Display": "14.2\" Liquid Retina XDR", "Ports": "3x Thunderbolt 4, HDMI, SDXC"}'::jsonb
where slug = 'macbook-pro-14-m4-pro';

update public.products set slug = 'macbook-pro-16-m4-pro', name = 'MacBook Pro 16" (M4 Pro)', brand = 'Apple',
  description = 'Pro performance on the biggest MacBook display, with up to 24 hours of battery life.',
  price_cents = 374900000, compare_at_cents = null, stock = 6, featured = false,
  specs = '{"Chip": "Apple M4 Pro", "Memory": "24GB unified", "Storage": "512GB SSD", "Display": "16.2\" Liquid Retina XDR", "Battery": "Up to 24 hours"}'::jsonb
where slug = 'macbook-pro-16-m4-max';

update public.products set slug = 'dell-xps-13', name = 'Dell XPS 13', brand = 'Dell',
  description = 'A compact, premium ultrabook with a near-borderless InfinityEdge display and a machined aluminium and carbon-fibre build.',
  price_cents = 149900000, compare_at_cents = 164900000, stock = 14, featured = true,
  specs = '{"CPU": "Intel Core i7", "Memory": "16GB", "Storage": "512GB SSD", "Display": "13.3\" InfinityEdge", "Weight": "1.2 kg"}'::jsonb
where slug = 'dell-xps-14';

update public.products set slug = 'lg-ultrafine-5k', name = 'LG UltraFine 5K Display', brand = 'LG',
  description = 'A 27-inch 5K display designed for the Mac, with single-cable Thunderbolt 3 connection and charging.',
  price_cents = 195000000, compare_at_cents = null, stock = 8, featured = true,
  specs = '{"Size": "27\"", "Resolution": "5120x2880", "Brightness": "500 nits", "Connectivity": "Thunderbolt 3 (94W charging)", "Extras": "Built-in camera and speakers"}'::jsonb
where slug = 'lg-ultrafine-27-4k';

update public.products set slug = 'apple-pro-display-xdr', name = 'Apple Pro Display XDR', brand = 'Apple',
  description = 'A 32-inch 6K Retina display with extreme dynamic range for professional colour and HDR work.',
  price_cents = 749900000, compare_at_cents = null, stock = 4, featured = false,
  specs = '{"Size": "32\"", "Resolution": "6016x3384", "Brightness": "1600 nits peak", "Contrast": "1,000,000:1", "Connectivity": "Thunderbolt 3"}'::jsonb
where slug = 'dell-ultrasharp-u3425we';

update public.products set slug = 'asus-proart-pa246q', name = 'ASUS ProArt PA246Q', brand = 'ASUS',
  description = 'A colour-accurate 24-inch IPS monitor for photo editing and design, covering 98% of Adobe RGB.',
  price_cents = 45000000, compare_at_cents = 52500000, stock = 10, featured = false,
  specs = '{"Size": "24.1\"", "Resolution": "1920x1200", "Panel": "IPS", "Colour": "98% Adobe RGB", "Connectivity": "DisplayPort, HDMI, DVI, VGA"}'::jsonb
where slug = 'samsung-odyssey-oled-g6';

update public.products set slug = 'keychron-k8', name = 'Keychron K8 Wireless Mechanical Keyboard', brand = 'Keychron',
  description = 'A tenkeyless wireless mechanical keyboard with Mac and Windows layouts in the box.',
  price_cents = 12000000, compare_at_cents = 13500000, stock = 30, featured = true,
  specs = '{"Layout": "Tenkeyless", "Switches": "Gateron mechanical", "Connection": "Bluetooth 5.1, USB-C", "Battery": "Up to 240 hours"}'::jsonb
where slug = 'keychron-q1-max';

update public.products set slug = 'logitech-g-pro-tkl', name = 'Logitech G PRO TKL Keyboard', brand = 'Logitech',
  description = 'A compact tenkeyless mechanical keyboard built with and for esports pros.',
  price_cents = 19500000, compare_at_cents = 22500000, stock = 14, featured = false,
  specs = '{"Layout": "Tenkeyless", "Switches": "GX Blue clicky", "Connection": "Detachable USB cable", "Lighting": "LIGHTSYNC RGB"}'::jsonb
where slug = 'razer-huntsman-v3-pro';

update public.products set slug = 'razer-deathadder-elite', name = 'Razer DeathAdder Elite', brand = 'Razer',
  description = 'The classic ergonomic esports mouse with a 16,000 DPI optical sensor.',
  price_cents = 7500000, compare_at_cents = 10500000, stock = 18, featured = false,
  specs = '{"Sensor": "16,000 DPI optical", "Connection": "Wired USB", "Buttons": "7", "Lighting": "Razer Chroma RGB"}'::jsonb
where slug = 'razer-deathadder-v3-pro';

update public.products set slug = 'sony-wh-1000xm3', name = 'Sony WH-1000XM3', brand = 'Sony',
  description = 'Award-winning noise cancellation and 30-hour battery life in a comfortable, foldable over-ear design.',
  price_cents = 30000000, compare_at_cents = 52500000, stock = 20, featured = true,
  specs = '{"Type": "Over-ear", "ANC": "Yes", "Battery": "Up to 30 hours", "Codecs": "LDAC, AAC, SBC"}'::jsonb
where slug = 'sony-wh-1000xm6';

update public.products set slug = 'airpods-pro-2', name = 'AirPods Pro (2nd generation)', brand = 'Apple',
  description = 'Active noise cancellation, Adaptive Audio and personalised spatial audio, with a USB-C MagSafe case.',
  price_cents = 29900000, compare_at_cents = 37400000, stock = 35, featured = true,
  specs = '{"Type": "In-ear", "ANC": "Yes", "Battery": "Up to 6 hours (ANC)", "Case": "USB-C MagSafe"}'::jsonb
where slug = 'airpods-pro-3';

update public.products set slug = 'belkin-magsafe-2-in-1', name = 'Belkin BoostCharge Pro 2-in-1 MagSafe Stand', brand = 'Belkin',
  description = 'Charge your iPhone with MagSafe and your AirPods at the same time from one stand.',
  price_cents = 15000000, compare_at_cents = 19500000, stock = 25, featured = true,
  specs = '{"Output": "15W MagSafe + 5W", "Compatible": "iPhone 12 and later, AirPods", "Power adapter": "Included"}'::jsonb
where slug = 'anker-prime-100w-gan';

update public.products set slug = 'apple-96w-usb-c', name = 'Apple 96W USB-C Power Adapter', brand = 'Apple',
  description = 'Fast charging for MacBook Pro, and compatible with any USB-C device.',
  price_cents = 11900000, compare_at_cents = null, stock = 40, featured = false,
  specs = '{"Output": "96W", "Ports": "1x USB-C", "Compatible": "MacBook Pro, MacBook Air, iPad, iPhone"}'::jsonb
where slug = 'apple-35w-dual-usb-c';

update public.products set slug = 'anker-powercore-10000', name = 'Anker PowerCore 10000', brand = 'Anker',
  description = 'A compact 10,000mAh power bank that charges most phones more than twice.',
  price_cents = 3900000, compare_at_cents = 4500000, stock = 40, featured = false,
  specs = '{"Capacity": "10,000 mAh", "Output": "12W", "Ports": "1x USB-A", "Weight": "180 g"}'::jsonb
where slug = 'anker-737-power-bank';

update public.products set image_url = '/images/products/' || slug || '.jpg';

commit;
