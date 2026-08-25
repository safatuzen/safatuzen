-- ============================================================
-- SafaTu Zen — full schema + RLS + storage + seed
-- Paste this ENTIRE file into Supabase → SQL Editor → Run.
-- Safe to re-run (idempotent).
-- ============================================================

-- ---------- TABLES ----------
create table if not exists public.products (
  id uuid pk default gen_random_uuid() primary key,
  name text not null,
  name_en text,
  slug text unique not null,
  description text,
  features jsonb default '[]'::jsonb,
  specs jsonb default '[]'::jsonb,
  category text not null check (category in ('grooming','wellness','beauty-kit','kitchen','offer')),
  price numeric not null check (price >= 0),
  compare_at_price numeric,
  stock int default 0,
  is_featured boolean default false,
  is_active boolean default true,
  warranty_months int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  url text not null,
  sort_order int default 0
);

create sequence if not exists public.order_no_seq start 1042;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text unique,
  customer_name text not null,
  phone text not null,
  address text not null,
  area text not null check (area in ('dhaka','outside')),
  delivery_charge numeric not null default 0,
  total numeric not null default 0,
  note text,
  status text default 'new' check (status in ('new','confirmed','shipped','delivered','cancelled')),
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  product_id uuid references public.products on delete set null,
  product_name text not null,
  unit_price numeric not null,
  qty int not null
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  quote text not null,
  rating int check (rating between 1 and 5) default 5,
  photo_url text,
  is_published boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.store_settings (
  id int primary key default 1,
  whatsapp_number text default '',
  messenger_url text default '',
  instagram_url text default '',
  email text default '',
  delivery_dhaka numeric default 60,
  delivery_outside numeric default 120,
  announcement text default '',
  hero_product_id uuid references public.products on delete set null,
  constraint store_settings_single_row check (id = 1)
);

-- ---------- TRIGGERS ----------
create or replace function public.set_order_no()
returns trigger language plpgsql as $$
begin
  if new.order_no is null or new.order_no = '' then
    new.order_no := 'SZ-' || nextval('public.order_no_seq');
  end if;
  return new;
end $$;

drop trigger if exists trg_set_order_no on public.orders;
create trigger trg_set_order_no
  before insert on public.orders
  for each row execute function public.set_order_no();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- ---------- ROW LEVEL SECURITY ----------
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.store_settings enable row level security;

-- products: public read, admin write
drop policy if exists "Public read products" on public.products;
create policy "Public read products" on public.products
  for select using (true);
drop policy if exists "Admin write products" on public.products;
create policy "Admin write products" on public.products
  for all to authenticated using (true) with check (true);

-- product_images: public read, admin write
drop policy if exists "Public read product images" on public.product_images;
create policy "Public read product images" on public.product_images
  for select using (true);
drop policy if exists "Admin write product images" on public.product_images;
create policy "Admin write product images" on public.product_images
  for all to authenticated using (true) with check (true);

-- orders: anyone may place an order (insert), only admin can read/update
drop policy if exists "Anyone can place order" on public.orders;
create policy "Anyone can place order" on public.orders
  for insert with check (true);
drop policy if exists "Admin read update orders" on public.orders;
create policy "Admin read update orders" on public.orders
  for select to authenticated using (true);
drop policy if exists "Admin update orders" on public.orders;
create policy "Admin update orders" on public.orders
  for update to authenticated using (true) with check (true);
drop policy if exists "Admin delete orders" on public.orders;
create policy "Admin delete orders" on public.orders
  for delete to authenticated using (true);

-- order_items: insert allowed (checkout), admin read/delete
drop policy if exists "Anyone can add order items" on public.order_items;
create policy "Anyone can add order items" on public.order_items
  for insert with check (true);
drop policy if exists "Admin read order items" on public.order_items;
create policy "Admin read order items" on public.order_items
  for select to authenticated using (true);
drop policy if exists "Admin delete order items" on public.order_items;
create policy "Admin delete order items" on public.order_items
  for delete to authenticated using (true);

-- reviews: published are public, admin manages all
drop policy if exists "Public read published reviews" on public.reviews;
create policy "Public read published reviews" on public.reviews
  for select using (is_published = true);
drop policy if exists "Admin manage reviews" on public.reviews;
create policy "Admin manage reviews" on public.reviews
  for all to authenticated using (true) with check (true);

-- store_settings: public read, admin write
drop policy if exists "Public read settings" on public.store_settings;
create policy "Public read settings" on public.store_settings
  for select using (true);
drop policy if exists "Admin write settings" on public.store_settings;
create policy "Admin write settings" on public.store_settings
  for all to authenticated using (true) with check (true);

-- ---------- STORAGE BUCKET ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read product-images" on storage.objects;
create policy "Public read product-images" on storage.objects
  for select using (bucket_id = 'product-images');

drop policy if exists "Admin upload product-images" on storage.objects;
create policy "Admin upload product-images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images');

drop policy if exists "Admin update product-images" on storage.objects;
create policy "Admin update product-images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images');

drop policy if exists "Admin delete product-images" on storage.objects;
create policy "Admin delete product-images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images');

-- ============================================================
-- SEED DATA (skips rows that already exist)
-- ============================================================

insert into public.products (name, name_en, slug, description, features, specs, category, price, compare_at_price, stock, is_featured, is_active, warranty_months)
values
(
  '৫-ইন-১ মাল্টিফাংশনাল বিউটি কিট', 'MS-8377', '5-in-1-beauty-kit-ms-8377',
  'একটি কিটেই আপনার সম্পূর্ণ গ্রুমিং যত্ন। নিরাপদ ব্লেড প্রযুক্তিতে কাটাছেঁড়ার কোনো চিন্তা ছাড়াই মুখ ও শরীরের যত্ন নিন — ঘরে বসেই পার্লার-স্টাইল ফিনিশ।',
  '["★ কাটাছেঁড়ার কোনো ভয় নেই — নিরাপদ ব্লেড প্রযুক্তি, ত্বকে খসখসে ভাব নেই","★ ৫টি আলাদা হেড (5 in 1) — মুখ ও শরীরের প্রতিটি অংশের জন্য","★ ডিজিটাল ডিসপ্লে — ব্যাটারি চার্জ সরাসরি দেখা যায়","★ কর্ডলেস ও ট্রাভেল ফ্রেন্ডলি","★ ৬ মাসের ওয়ারেন্টি"]'::jsonb,
  '[]'::jsonb,
  'grooming', 1450, null, 25, true, true, 6
),
(
  'পিরিয়ড হিটিং প্যাড', 'Period Heating Pad', 'period-heating-pad',
  'পিরিয়ডের পেট ব্যথায় রিলিফ, মাংশপেশী রিল্যাক্স, ফ্লো স্বাভাবিক রাখতে সহায়ক। মেটেরিয়াল: ABS+PC প্রিমিয়াম বডি, সফট PU লেদার ফিনিশ, ইলাস্টিক অ্যাডজাস্টেবল বেল্ট, গ্রাফিন/কার্বন ফাইবার হিটিং, ত্বক-বান্ধব ভেলভেট লাইনার।',
  '["★ পিরিয়ডের ব্যথায় দ্রুত রিলিফ","★ কোমর ও পেটে ব্যবহারযোগ্য","★ ভেলভেট লাইনার — ত্বক-বান্ধব","★ ৬ মাসের ওয়ারেন্টি"]'::jsonb,
  '[{"label":"হিটিং লেভেল","value":"৩ লেভেল (Low / Medium / High)"},{"label":"ম্যাসাজ","value":"৩ লেভেল ভাইব্রেশন"},{"label":"চার্জিং","value":"USB Type-C রিচার্জেবল"},{"label":"ডিসপ্লে","value":"LED ডিজিটাল"},{"label":"ডিজাইন","value":"কর্ডলেস ও পোর্টেবল"}]'::jsonb,
  'wellness', 750, null, 30, true, true, 6
),
(
  'স্মার্ট স্ক্যাল্প ম্যাসাজার', 'Smart Scalp Massager', 'smart-scalp-massager',
  'দিনের ক্লান্তি দূর করুন কয়েক মিনিটের স্ক্যাল্প ম্যাসাজে। মাথাব্যথা কমিয়ে মন ও মাথা — দুটোই থাকবে ঝরঝরে।',
  '["★ মাথাব্যথা কমায়, মানসিক প্রশান্তি আনে","★ ব্রেইনের রক্ত সঞ্চালন বাড়ায় (সেন্সর লাইটসহ)","★ স্ট্রেস ও ক্লান্তি দূর করে","★ হালকা ও বহনযোগ্য","★ রিচার্জেবল ব্যাটারি চালিত"]'::jsonb,
  '[]'::jsonb,
  'grooming', 799, null, 20, false, true, null
),
(
  '২-ইন-১ ডুয়াল হেড শেভার', 'Dual Head Female Trimmer', '2-in-1-dual-head-shaver',
  'দুই হেডের ডাবল পাওয়ার — ট্রিমিং + হেয়ারকাট একসাথে। অবাঞ্ছিত লোম রেজারের মতো স্মুথভাবে ক্লিন, কোনো ব্যথা নেই।',
  '["★ দুই পাশে দুটি হেড — ডাবল পাওয়ার ট্রিমিং + অতিরিক্ত হেয়ারকাটের ক্লিপ","★ অবাঞ্ছিত লোম রেজারের মতো স্মুথভাবে ক্লিন","★ মাথার ছোট চুল কাটা যায়","★ ব্যথা বা কাটাছেঁড়ার ভয় নেই","★ ত্বক কালো হওয়ার সম্ভাবনা নেই"]'::jsonb,
  '[]'::jsonb,
  'grooming', 1200, 1500, 18, true, true, null
),
(
  'Xiaomi Enchen Blackstone ইলেকট্রিক শেভার', 'Enchen Blackstone', 'xiaomi-enchen-blackstone-shaver',
  '3D ফ্লোটিং ব্লেড প্রযুক্তিতে ইনস্ট্যান্ট, স্মুথ শেভ। এক চার্জে দীর্ঘ ব্যবহার — ডেইলি গ্রুমিংয়ের পারফেক্ট সঙ্গী।',
  '["★ 3D Floating Cutter Head — যেকোনো ফেস শেপে মানানসই","★ ডাবল-লুপ আল্ট্রা-থিন ব্লেড — ইনস্ট্যান্ট ও স্মুথ শেভ","★ ইজি স্প্লিট ডিজাইন — কাটার হেড খুলে পানিতে ধোয়া যায়","★ কোয়ালিটিফুল স্টিল ব্লেড — অত্যন্ত ডিউরেবল","★ এক চার্জে দীর্ঘ ব্যবহার — ডেইলি ব্যবহারের জন্য পারফেক্ট"]'::jsonb,
  '[]'::jsonb,
  'grooming', 1790, 2200, 15, false, true, null
),
(
  'কফি মিক্সার (হ্যান্ড)', 'Hand Coffee Mixer', 'hand-coffee-mixer',
  'চামচ ছাড়াই চা, কফি, ডিম, শরবত, জুস — সবকিছু পারফেক্ট মিক্স। ফোমি কফি/দুধের জন্য আদর্শ।',
  '["★ একবার চার্জে অনেকদিন চলে","★ চামচ ছাড়াই চা, কফি, ডিম, শরবত, জুস মিক্স","★ ফোমি কফি/দুধের জন্য আদর্শ","★ নন-স্টিকি ও ফ্লেক্সিবল, সহজে পরিষ্কারযোগ্য","★ স্টেইনলেস স্টিল স্প্রিং + প্লাস্টিক বডি"]'::jsonb,
  '[]'::jsonb,
  'kitchen', 410, null, 40, false, true, null
)
on conflict (slug) do nothing;

update public.store_settings set hero_product_id = (select id from public.products where slug = '5-in-1-beauty-kit-ms-8377')
where id = 1 and hero_product_id is null;

insert into public.reviews (customer_name, quote, rating, is_published)
select * from (values
  ('সুমাইয়া আক্তার', 'বিউটি কিটটা হাতে পেয়ে সত্যিই খুশি! কোয়ালিটি দেখে মনেই হয়নি অনলাইনে কেনা। ডেলিভারিও পেয়েছি ঠিক সময়ে। আলহামদুলিল্লাহ 💗', 5, true),
  ('তানজিলা রহমান', 'হিটিং প্যাডটা পিরিয়ডের সময় এখন আমার রোজকার সঙ্গী। ভাইব্রেশনসহ ব্যথা অনেকটাই কমে যায়। ধন্যবাদ SafaTu Zen!', 5, true),
  ('নুসরাত জাহান', 'কফি মিক্সার দিয়ে এখন সকালের কফি ফোমি হয়ে যায় নিমিষেই। দামের তুলনায় দারুণ প্রোডাক্ট।', 4, true)
) as seed(customer_name, quote, rating, is_published)
where not exists (select 1 from public.reviews);

insert into public.store_settings (id, whatsapp_number, messenger_url, instagram_url, email, delivery_dhaka, delivery_outside, announcement)
values (1, '', 'https://www.facebook.com/safaTuZen', 'https://www.instagram.com/safatuzen/', 'safatuzen24250@gmail.com', 60, 120, '🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি · ২,৩০০+ হ্যাপি কাস্টমার')
on conflict (id) do nothing;

-- Done. Next step: create your admin login under Authentication → Users.
