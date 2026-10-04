-- =====================================================================
-- Veyro — seed data (10 categories, 40 products)
-- Run after schema.sql. Safe to re-run: existing slugs are skipped.
-- Prices are in kobo (₦1 = 100), e.g. 149900000 = ₦1,499,000.
-- Product photos live in public/images/products/<slug>.jpg (credits: src/app/credits/page.tsx).
-- =====================================================================

insert into public.categories (slug, name, description, kind, sort_order) values
  ('macbooks',          'MacBooks',          'Apple silicon laptops for work, study and creative pros.', 'laptop',     1),
  ('windows-laptops',   'Windows Laptops',   'Ultrabooks, gaming rigs and business machines.',          'laptop',     2),
  ('iphones',           'iPhones',           'The latest iPhone lineup, unlocked.',                     'phone',      3),
  ('android-phones',    'Android Phones',    'Flagships and foldables from Samsung, Google and more.',  'phone',      4),
  ('monitors',          'Monitors',          '4K, ultrawide and high-refresh displays.',                'monitor',    5),
  ('keyboards',         'Keyboards',         'Mechanical, low-profile and wireless keyboards.',         'keyboard',   6),
  ('mice',              'Mice',              'Ergonomic, gaming and travel mice.',                      'mouse',      7),
  ('headphones',        'Headphones',        'Noise-cancelling over-ears and true wireless earbuds.',   'headphones', 8),
  ('chargers',          'Chargers',          'GaN wall chargers, power banks and cables.',              'charger',    9),
  ('ssds',              'SSDs',              'Internal NVMe and portable solid-state storage.',         'ssd',       10)
on conflict (slug) do nothing;

insert into public.products
  (category_id, slug, name, brand, description, price_cents, compare_at_cents, stock, specs, accent, featured, image_url)
select c.id, v.slug, v.name, v.brand, v.description, v.price_cents, v.compare_at_cents::int, v.stock, v.specs::jsonb, v.accent, v.featured,
       '/images/products/' || v.slug || '.jpg'
from (values
  -- MacBooks
  ('macbooks', 'macbook-air-13-m4', 'MacBook Air 13" (M4)', 'Apple',
   'Impossibly thin and silent, with all-day battery life and the M4 chip for everyday speed.',
   149900000, null, 25, '{"Chip":"Apple M4","Memory":"16GB unified","Storage":"256GB SSD","Display":"13.6\" Liquid Retina","Battery":"Up to 18 hours"}', '#7dd3fc', true),
  ('macbooks', 'macbook-air-15-m4', 'MacBook Air 15" (M4)', 'Apple',
   'A bigger canvas in the same fanless design, ideal for multitasking students and professionals.',
   179900000, null, 18, '{"Chip":"Apple M4","Memory":"16GB unified","Storage":"512GB SSD","Display":"15.3\" Liquid Retina","Battery":"Up to 18 hours"}', '#a5b4fc', false),
  ('macbooks', 'macbook-pro-14-m5', 'MacBook Pro 14" (M5)', 'Apple',
   'The M5 chip brings a big leap in graphics and AI performance to the 14-inch MacBook Pro, with a stunning Liquid Retina XDR display.',
   239900000, null, 12, '{"Chip": "Apple M5", "Memory": "16GB unified", "Storage": "512GB SSD", "Display": "14.2\" Liquid Retina XDR", "Ports": "3x Thunderbolt 4, HDMI, SDXC"}', '#94a3b8', true),
  ('macbooks', 'macbook-pro-16-m4-pro', 'MacBook Pro 16" (M4 Pro)', 'Apple',
   'Pro performance on the biggest MacBook display, with up to 24 hours of battery life.',
   374900000, null, 6, '{"Chip": "Apple M4 Pro", "Memory": "24GB unified", "Storage": "512GB SSD", "Display": "16.2\" Liquid Retina XDR", "Battery": "Up to 24 hours"}', '#64748b', false),

  -- Windows laptops
  ('windows-laptops', 'dell-xps-13', 'Dell XPS 13', 'Dell',
   'A compact, premium ultrabook with a near-borderless InfinityEdge display and a machined aluminium and carbon-fibre build.',
   149900000, 164900000, 14, '{"CPU": "Intel Core i7", "Memory": "16GB", "Storage": "512GB SSD", "Display": "13.3\" InfinityEdge", "Weight": "1.2 kg"}', '#cbd5e1', true),
  ('windows-laptops', 'lenovo-thinkpad-x1-carbon', 'ThinkPad X1 Carbon Gen 13', 'Lenovo',
   'The legendary business laptop: featherweight, durable, and a keyboard people love.',
   284900000, 299900000, 10, '{"CPU":"Intel Core Ultra 7","Memory":"32GB","Storage":"1TB SSD","Display":"14\" 2.8K OLED","Weight":"0.99 kg"}', '#1f2937', false),
  ('windows-laptops', 'asus-rog-zephyrus-g14', 'ASUS ROG Zephyrus G14', 'ASUS',
   'A compact gaming powerhouse with an OLED 120Hz panel and RTX graphics.',
   269900000, null, 9, '{"CPU":"AMD Ryzen AI 9","GPU":"NVIDIA RTX 5070","Memory":"32GB","Storage":"1TB SSD","Display":"14\" 3K OLED 120Hz"}', '#f472b6', false),
  ('windows-laptops', 'hp-spectre-x360-14', 'HP Spectre x360 14', 'HP',
   'A convertible 2-in-1 that flips from laptop to tablet, pen included.',
   224900000, 239900000, 11, '{"CPU":"Intel Core Ultra 7","Memory":"16GB","Storage":"1TB SSD","Display":"14\" 2.8K OLED touch","Extras":"HP Rechargeable MPP2.0 pen"}', '#0f766e', false),

  -- iPhones
  ('iphones', 'iphone-17-pro-max', 'iPhone 17 Pro Max', 'Apple',
   'The biggest display and best battery life ever on an iPhone, with a pro camera system.',
   179900000, null, 20, '{"Display":"6.9\" Super Retina XDR","Chip":"A19 Pro","Storage":"256GB","Camera":"48MP Fusion triple system"}', '#fb923c', true),
  ('iphones', 'iphone-17-pro', 'iPhone 17 Pro', 'Apple',
   'Pro power in a more pocketable size, with an aluminium unibody design.',
   164900000, null, 22, '{"Display":"6.3\" Super Retina XDR","Chip":"A19 Pro","Storage":"256GB","Camera":"48MP Fusion triple system"}', '#3b82f6', false),
  ('iphones', 'iphone-air', 'iPhone Air', 'Apple',
   'The thinnest iPhone ever made, with titanium design and pro-level performance.',
   149900000, null, 15, '{"Display":"6.5\" Super Retina XDR","Chip":"A19 Pro","Storage":"256GB","Camera":"48MP Fusion"}', '#e0f2fe', false),
  ('iphones', 'iphone-17', 'iPhone 17', 'Apple',
   'A brighter ProMotion display, faster chip and great cameras at an everyday price.',
   119900000, null, 30, '{"Display":"6.3\" Super Retina XDR 120Hz","Chip":"A19","Storage":"256GB","Camera":"48MP Dual Fusion"}', '#a78bfa', false),

  -- Android phones
  ('android-phones', 'samsung-galaxy-s25-ultra', 'Samsung Galaxy S25 Ultra', 'Samsung',
   'A titanium flagship with a built-in S Pen and 200MP camera.',
   195000000, null, 16, '{"Display":"6.9\" QHD+ AMOLED 120Hz","Chip":"Snapdragon 8 Elite","Storage":"256GB","Camera":"200MP quad"}', '#475569', true),
  ('android-phones', 'google-pixel-10-pro', 'Google Pixel 10 Pro', 'Google',
   'Google''s smartest phone, with Tensor G5 and best-in-class computational photography.',
   149900000, null, 14, '{"Display":"6.3\" LTPO OLED 120Hz","Chip":"Google Tensor G5","Storage":"128GB","Camera":"50MP triple"}', '#86efac', false),
  ('android-phones', 'oneplus-13', 'OnePlus 13', 'OnePlus',
   'Blazing performance with 100W charging that fills the battery in under 40 minutes.',
   135000000, 142500000, 12, '{"Display":"6.82\" QHD+ AMOLED","Chip":"Snapdragon 8 Elite","Storage":"256GB","Charging":"100W wired, 50W wireless"}', '#22d3ee', false),
  ('android-phones', 'samsung-galaxy-z-fold7', 'Samsung Galaxy Z Fold7', 'Samsung',
   'A phone that unfolds into a tablet, now thinner and lighter than ever.',
   300000000, null, 7, '{"Main display":"8\" Dynamic AMOLED","Cover display":"6.5\"","Chip":"Snapdragon 8 Elite","Storage":"256GB"}', '#1e3a8a', false),

  -- Monitors
  ('monitors', 'lg-ultrafine-5k', 'LG UltraFine 5K Display', 'LG',
   'A 27-inch 5K display designed for the Mac, with single-cable Thunderbolt 3 connection and charging.',
   195000000, null, 8, '{"Size": "27\"", "Resolution": "5120x2880", "Brightness": "500 nits", "Connectivity": "Thunderbolt 3 (94W charging)", "Extras": "Built-in camera and speakers"}', '#38bdf8', true),
  ('monitors', 'apple-pro-display-xdr', 'Apple Pro Display XDR', 'Apple',
   'A 32-inch 6K Retina display with extreme dynamic range for professional colour and HDR work.',
   749900000, null, 4, '{"Size": "32\"", "Resolution": "6016x3384", "Brightness": "1600 nits peak", "Contrast": "1,000,000:1", "Connectivity": "Thunderbolt 3"}', '#334155', false),
  ('monitors', 'asus-proart-pa246q', 'ASUS ProArt PA246Q', 'ASUS',
   'A colour-accurate 24-inch IPS monitor for photo editing and design, covering 98% of Adobe RGB.',
   45000000, 52500000, 10, '{"Size": "24.1\"", "Resolution": "1920x1200", "Panel": "IPS", "Colour": "98% Adobe RGB", "Connectivity": "DisplayPort, HDMI, DVI, VGA"}', '#c084fc', false),
  ('monitors', 'apple-studio-display', 'Apple Studio Display', 'Apple',
   'A 27-inch 5K Retina display with a 12MP Center Stage camera and studio-quality mics.',
   239900000, null, 6, '{"Size":"27\"","Resolution":"5120x2880","Brightness":"600 nits","Camera":"12MP Center Stage","Connectivity":"Thunderbolt 3"}', '#e2e8f0', false),

  -- Keyboards
  ('keyboards', 'logitech-mx-keys-s', 'Logitech MX Keys S', 'Logitech',
   'Quiet, precise low-profile typing with smart backlighting across three devices.',
   16500000, null, 40, '{"Layout":"Full size","Connection":"Bluetooth, Logi Bolt","Battery":"Up to 10 days (backlit)","Backlight":"Smart illumination"}', '#52525b', false),
  ('keyboards', 'keychron-k8', 'Keychron K8 Wireless Mechanical Keyboard', 'Keychron',
   'A tenkeyless wireless mechanical keyboard with Mac and Windows layouts in the box.',
   12000000, 13500000, 30, '{"Layout": "Tenkeyless", "Switches": "Gateron mechanical", "Connection": "Bluetooth 5.1, USB-C", "Battery": "Up to 240 hours"}', '#f59e0b', true),
  ('keyboards', 'apple-magic-keyboard-touch-id', 'Magic Keyboard with Touch ID', 'Apple',
   'Wireless, rechargeable and secure, with Touch ID for Macs with Apple silicon.',
   22400000, null, 25, '{"Layout":"Full size with numeric keypad","Connection":"Bluetooth, USB-C","Extras":"Touch ID"}', '#f1f5f9', false),
  ('keyboards', 'logitech-g-pro-tkl', 'Logitech G PRO TKL Keyboard', 'Logitech',
   'A compact tenkeyless mechanical keyboard built with and for esports pros.',
   19500000, 22500000, 14, '{"Layout": "Tenkeyless", "Switches": "GX Blue clicky", "Connection": "Detachable USB cable", "Lighting": "LIGHTSYNC RGB"}', '#22c55e', false),

  -- Mice
  ('mice', 'logitech-mx-master-3s', 'Logitech MX Master 3S', 'Logitech',
   'The productivity icon: quiet clicks, 8K DPI tracking and MagSpeed scrolling.',
   15000000, null, 45, '{"Sensor":"8000 DPI","Connection":"Bluetooth, Logi Bolt","Battery":"Up to 70 days","Buttons":"7"}', '#71717a', true),
  ('mice', 'razer-deathadder-elite', 'Razer DeathAdder Elite', 'Razer',
   'The classic ergonomic esports mouse with a 16,000 DPI optical sensor.',
   7500000, 10500000, 18, '{"Sensor": "16,000 DPI optical", "Connection": "Wired USB", "Buttons": "7", "Lighting": "Razer Chroma RGB"}', '#16a34a', false),
  ('mice', 'apple-magic-mouse', 'Apple Magic Mouse', 'Apple',
   'Multi-Touch surface for gestures, now with USB-C charging.',
   11900000, null, 30, '{"Connection":"Bluetooth","Charging":"USB-C","Surface":"Multi-Touch"}', '#f8fafc', false),
  ('mice', 'logitech-g-pro-x-superlight-2', 'Logitech G Pro X Superlight 2', 'Logitech',
   'Pro-grade 60g wireless gaming mouse with HERO 2 sensor.',
   24000000, 25500000, 14, '{"Sensor":"HERO 2, 32K DPI","Weight":"60 g","Connection":"LIGHTSPEED","Battery":"Up to 95 hours"}', '#ec4899', false),

  -- Headphones
  ('headphones', 'sony-wh-1000xm3', 'Sony WH-1000XM3', 'Sony',
   'Award-winning noise cancellation and 30-hour battery life in a comfortable, foldable over-ear design.',
   30000000, 52500000, 20, '{"Type": "Over-ear", "ANC": "Yes", "Battery": "Up to 30 hours", "Codecs": "LDAC, AAC, SBC"}', '#0f172a', true),
  ('headphones', 'airpods-pro-2', 'AirPods Pro (2nd generation)', 'Apple',
   'Active noise cancellation, Adaptive Audio and personalised spatial audio, with a USB-C MagSafe case.',
   29900000, 37400000, 35, '{"Type": "In-ear", "ANC": "Yes", "Battery": "Up to 6 hours (ANC)", "Case": "USB-C MagSafe"}', '#f5f5f4', true),
  ('headphones', 'airpods-max', 'AirPods Max', 'Apple',
   'High-fidelity over-ear audio with computational audio and spatial sound.',
   82400000, null, 8, '{"Type":"Over-ear","ANC":"Yes","Battery":"Up to 20 hours","Charging":"USB-C"}', '#93c5fd', false),
  ('headphones', 'bose-quietcomfort-ultra-earbuds', 'Bose QuietComfort Ultra Earbuds', 'Bose',
   'World-class noise cancellation and immersive audio in a compact earbud.',
   44900000, 49400000, 16, '{"Type":"In-ear","ANC":"Yes","Battery":"Up to 6 hours","Water resistance":"IPX4"}', '#fcd34d', false),

  -- Chargers
  ('chargers', 'belkin-magsafe-2-in-1', 'Belkin BoostCharge Pro 2-in-1 MagSafe Stand', 'Belkin',
   'Charge your iPhone with MagSafe and your AirPods at the same time from one stand.',
   15000000, 19500000, 25, '{"Output": "15W MagSafe + 5W", "Compatible": "iPhone 12 and later, AirPods", "Power adapter": "Included"}', '#06b6d4', true),
  ('chargers', 'apple-96w-usb-c', 'Apple 96W USB-C Power Adapter', 'Apple',
   'Fast charging for MacBook Pro, and compatible with any USB-C device.',
   11900000, null, 40, '{"Output": "96W", "Ports": "1x USB-C", "Compatible": "MacBook Pro, MacBook Air, iPad, iPhone"}', '#e5e7eb', false),
  ('chargers', 'samsung-45w-super-fast', 'Samsung 45W Super Fast Charger', 'Samsung',
   'Super Fast Charging 2.0 for Galaxy phones, tablets and laptops.',
   7500000, null, 35, '{"Output":"45W","Ports":"1x USB-C","Cable":"5A USB-C cable included"}', '#1e293b', false),
  ('chargers', 'anker-powercore-10000', 'Anker PowerCore 10000', 'Anker',
   'A compact 10,000mAh power bank that charges most phones more than twice.',
   3900000, 4500000, 40, '{"Capacity": "10,000 mAh", "Output": "12W", "Ports": "1x USB-A", "Weight": "180 g"}', '#3f3f46', false),

  -- SSDs
  ('ssds', 'samsung-990-pro-2tb', 'Samsung 990 PRO 2TB', 'Samsung',
   'Flagship PCIe 4.0 NVMe SSD with up to 7,450 MB/s reads.',
   25500000, 30000000, 30, '{"Capacity":"2TB","Interface":"PCIe 4.0 x4 NVMe","Read":"7,450 MB/s","Write":"6,900 MB/s","Form factor":"M.2 2280"}', '#f97316', true),
  ('ssds', 'wd-black-sn850x-1tb', 'WD_BLACK SN850X 1TB', 'Western Digital',
   'A gaming-grade NVMe SSD that also works in PS5.',
   13500000, null, 28, '{"Capacity":"1TB","Interface":"PCIe 4.0 x4 NVMe","Read":"7,300 MB/s","Write":"6,300 MB/s","Form factor":"M.2 2280"}', '#18181b', false),
  ('ssds', 'samsung-t9-portable-2tb', 'Samsung T9 Portable SSD 2TB', 'Samsung',
   'Pocket-sized external SSD with USB 3.2 Gen 2x2 speeds up to 2,000 MB/s.',
   30000000, null, 18, '{"Capacity":"2TB","Interface":"USB 3.2 Gen 2x2","Read":"2,000 MB/s","Durability":"3m drop resistant"}', '#27272a', false),
  ('ssds', 'sandisk-extreme-portable-1tb', 'SanDisk Extreme Portable SSD 1TB', 'SanDisk',
   'Rugged, water-resistant portable SSD with a carabiner loop.',
   16500000, 19500000, 25, '{"Capacity":"1TB","Interface":"USB 3.2 Gen 2","Read":"1,050 MB/s","Rating":"IP65"}', '#ef4444', false)
) as v(cat, slug, name, brand, description, price_cents, compare_at_cents, stock, specs, accent, featured)
join public.categories c on c.slug = v.cat
on conflict (slug) do nothing;
