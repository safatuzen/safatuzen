import Link from "next/link";
import { Star } from "lucide-react";
import {
  getActiveProducts,
  getFeaturedProducts,
  getPublishedReviews,
  getProductBySlug,
  getSettings,
} from "@/lib/data";
import type { ProductWithImages } from "@/lib/types";
import { Hero, HowToOrder, ValueProps } from "@/components/sections";
import { ProductCard } from "@/components/product-card";
import { Reveal, Stagger } from "@/components/motion";

export const revalidate = 60;

const CATEGORIES = [
  { key: "", label: "সব" },
  { key: "grooming", label: "গ্রুমিং" },
  { key: "wellness", label: "ওয়েলনেস" },
  { key: "beauty-kit", label: "বিউটি কিট" },
  { key: "kitchen", label: "কিচেন" },
  { key: "offer", label: "অফার" },
];

export default async function HomePage() {
  const [settings, featured, reviews] = await Promise.all([
    getSettings(),
    getFeaturedProducts(4),
    getPublishedReviews(),
  ]);

  let heroProduct: ProductWithImages | null = null;
  if (settings.hero_product_id) {
    const slug =
      (await getActiveProducts()).find((p) => p.id === settings.hero_product_id)?.slug ?? null;
    if (slug) heroProduct = await getProductBySlug(slug);
  }
  if (!heroProduct && featured[0]) heroProduct = { ...featured[0], images: [] };

  return (
    <>
      <Hero heroProduct={heroProduct} />

      <section className="mx-auto max-w-6xl px-4">
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <Link
              key={c.key || "all"}
              href={c.key ? `/shop?cat=${c.key}` : "/shop"}
              className="min-h-[40px] shrink-0 rounded-full border border-hairline bg-surface px-5 py-2 text-sm font-medium text-ink transition-colors hover:border-primary hover:text-primary"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      <section id="featured" className="mx-auto max-w-6xl px-4 pt-10">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="font-bserif text-3xl font-bold text-ink">ফিচার্ড প্রোডাক্ট</h2>
            <Link href="/shop" className="text-sm font-medium text-primary hover:text-primary-deep">
              সব দেখুন →
            </Link>
          </div>
        </Reveal>

        {featured.length > 0 ? (
          <Stagger className="mt-7 grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Stagger>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-hairline bg-surface p-8 text-center text-sm text-ink-soft">
            প্রোডাক্ট শীঘ্রই যোগ করা হচ্ছে। Admin প্যানেল থেকে প্রথম প্রোডাক্টটি যোগ করুন!
          </p>
        )}
      </section>

      <ValueProps />

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <Reveal>
          <div className="flex items-end justify-between">
            <h2 className="font-bserif text-3xl font-bold text-ink">হ্যাপি কাস্টমার</h2>
            <Link href="/reviews" className="text-sm font-medium text-primary hover:text-primary-deep">
              সব রিভিউ →
            </Link>
          </div>
        </Reveal>
        {reviews.length > 0 ? (
          <Stagger className="mt-7 grid gap-4 md:grid-cols-3">
            {reviews.slice(0, 3).map((r) => (
              <figure key={r.id} className="rounded-3xl border border-hairline bg-surface p-6 shadow-soft">
                <div className="flex gap-0.5 text-accent">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="mt-3 text-sm leading-relaxed text-ink">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-4 text-sm font-semibold text-ink-soft">— {r.customer_name}</figcaption>
              </figure>
            ))}
          </Stagger>
        ) : null}
      </section>

      <HowToOrder />
    </>
  );
}
