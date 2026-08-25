# SafaTu Zen — E-Commerce Web App

Mobile-first, Bengali-first COD storefront + admin panel for the SafaTu Zen brand.
Built with Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Supabase.

## 1. Environment variables

Create `.env.local` (copy `.env.example`) and fill in:

| Variable | Where to find it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same page (`anon public`) |
| `SUPABASE_SERVICE_ROLE_KEY` | same page (`service_role`, secret — server only) |
| `NEXT_PUBLIC_SITE_URL` | your final URL, e.g. `https://safatuzen.vercel.app` |

Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

## 2. Database setup (one time)

1. Open Supabase → **SQL Editor** → paste the entire contents of [`supabase/migration.sql`](supabase/migration.sql) → **Run**.
   This creates all tables, RLS policies, the storage bucket, and seeds the 6 launch products + reviews + settings.
2. Create your admin login: Supabase → **Authentication → Users → Add user**
   (or run `node scripts/create-admin.mjs` after filling `.env.local`).
3. Done. Log in at `/admin/login`.

## 3. Run locally

```bash
npm install
npm run dev
```

## 4. Deploy on Vercel

1. Push this repo to GitHub.
2. Vercel → **Add New Project → Import** the repo.
3. Add the env vars from §1 (Production).
4. Deploy. Every push to `main` redeploys automatically.

## 5. Owner quick-start (admin panel)

- `/admin` — dashboard: নতুন অর্ডার, প্রোডাক্ট, স্টক, রিভিউ stats.
- `/admin/products` — ➕ add product; upload photos (auto-resized to WebP); toggle **শোকেসে দেখান / ফিচার্ড** inline; edit/delete with confirmation.
- `/admin/orders` — tap an order for address/note; one-tap status stepper (নতুন → কনফার্মড → শিপড → ডেলিভার্ড); call or WhatsApp the customer directly.
- `/admin/reviews` — curate testimonials shown on `/reviews`.
- `/admin/settings` — delivery charges, WhatsApp number, social links, announcement bar, hero product.

## 6. Architecture notes

- **No cart by design** — every card/product leads straight to a single-product COD checkout (schema keeps `order_items` so a cart could be added later).
- Public pages use ISR (`revalidate = 60`); admin is fully dynamic behind auth.
- Auth: Supabase email/password; `/admin/*` guarded by `proxy.ts` + server-side `getUser()` in the layout; every mutation runs `requireAdmin()` and uses the service-role client server-side only.
- RLS: public read of products/images/published reviews/settings; anon may only INSERT orders; everything else authenticated-only.
- Images: uploaded from the admin panel after client-side resize (max 1600px, WebP) into the public `product-images` bucket.
- SEO: per-product metadata + OpenGraph, `Product` JSON-LD, sitemap, robots, PWA manifest.
