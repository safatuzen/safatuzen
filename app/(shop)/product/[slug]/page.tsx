import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BadgeCheck, MessageCircle, ShieldCheck, Truck, Star } from "lucide-react";
import { getProductBySlug, getRelatedProducts, getSettings } from "@/lib/data";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatBDT, toBn, waLink } from "@/lib/utils";
import { PriceBlock } from "@/components/price-block";
import { ProductCard } from "@/components/product-card";
import { Reveal, Stagger } from "@/components/motion";
import { Gallery } from "./gallery";

export const revalidate = 60;

export async function generateStaticParams() {
  const { getProductSlugs } = await import("@/lib/data");
  const slugs = await getProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "প্রোডাক্ট পাওয়া যায়নি" };
  return {
    title: product.name,
    description:
      product.description?.slice(0, 150) ??
      `${product.name} — ক্যাশ অন ডেলিভারিতে সারা বাংলাদেশে হোম ডেলিভারি।`,
    openGraph: product.images[0]
      ? { images: [{ url: product.images[0].url }] }
      : undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([
    getSettings(),
    getRelatedProducts(product.category, product.id),
  ]);

  const inStock = product.stock > 0;
  const waMessage = `আসসালামু আলাইকুম! আমি অর্ডার করতে চাই:\n\n📦 ${product.name}${product.name_en ? ` (${product.name_en})` : ""}\n💰 দাম: ${formatBDT(product.price)}\n🔢 পরিমাণ: ১টি\n\nঅনুগ্রহ করে কনফার্ম করুন।`;
  const waHref = waLink(settings.whatsapp_number, waMessage);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 pt-8 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            description: product.description ?? undefined,
            image: product.images.map((i) => i.url),
            sku: product.name_en ?? product.slug,
            offers: {
              "@type": "Offer",
              priceCurrency: "BDT",
              price: product.price,
              availability: inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />

      <nav className="text-sm text-ink-soft">
        <Link href="/shop" className="hover:text-primary">শপ</Link>
        <span className="mx-2">/</span>
        <span>{CATEGORY_LABELS[product.category]}</span>
      </nav>

      <div className="mt-5 grid gap-9 lg:grid-cols-2">
        <Gallery images={product.images} name={product.name} />

        <div>
          {product.name_en ? (
            <p className="font-poppins text-xs uppercase tracking-[0.2em] text-ink-soft">
              {product.name_en}
            </p>
          ) : null}
          <h1 className="mt-1 font-bserif text-3xl font-bold leading-snug text-ink sm:text-4xl">
            {product.name}
          </h1>

          <div className="mt-4">
            <PriceBlock price={product.price} compareAtPrice={product.compare_at_price} size="lg" />
            <p className={`mt-2 flex items-center gap-1.5 text-sm ${inStock ? "text-success" : "text-danger"}`}>
              <BadgeCheck size={16} />
              {inStock ? `স্টক আছে (${toBn(product.stock)}টি)` : "স্টক শেষ"}
            </p>
          </div>

          {product.description ? (
            <p className="mt-5 leading-relaxed text-ink/90">{product.description}</p>
          ) : null}

          {product.features.length > 0 ? (
            <ul className="mt-5 space-y-2.5 rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
              {product.features.map((f, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink">
                  <Star size={14} className="mt-1 shrink-0 text-accent" fill="currentColor" strokeWidth={0} />
                  {f.replace(/^★\s*/, "")}
                </li>
              ))}
            </ul>
          ) : null}

          {product.specs.length > 0 ? (
            <table className="mt-5 w-full overflow-hidden rounded-2xl border border-hairline text-sm">
              <tbody>
                {product.specs.map((s, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-blush/50" : "bg-surface"}>
                    <td className="px-4 py-2.5 font-medium text-ink">{s.label}</td>
                    <td className="px-4 py-2.5 text-ink-soft">{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}

          <ul className="mt-5 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
            <li className="flex items-center gap-2"><Truck size={16} className="shrink-0 text-primary" /> ঢাকার ভিতরে {formatBDT(settings.delivery_dhaka)} · বাইরে {formatBDT(settings.delivery_outside)}</li>
            <li className="flex items-center gap-2"><BadgeCheck size={16} className="shrink-0 text-primary" /> ক্যাশ অন ডেলিভারি</li>
            {product.warranty_months ? (
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="shrink-0 text-primary" /> {toBn(product.warranty_months)} মাসের ওয়ারেন্টি</li>
            ) : null}
          </ul>

          {/* Desktop CTAs */}
          <div className="mt-7 hidden gap-3 lg:flex">
            {inStock ? (
              <Link
                href={`/checkout?slug=${product.slug}`}
                className="flex h-[52px] min-w-[240px] flex-1 items-center justify-center rounded-full bg-primary text-base font-semibold text-white shadow-lift transition-colors hover:bg-primary-deep"
              >
                অর্ডার করুন (ক্যাশ অন ডেলিভারি)
              </Link>
            ) : null}
            {settings.whatsapp_number ? (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-success px-6 text-base font-semibold text-white transition-opacity hover:opacity-90"
              >
                <MessageCircle size={20} />
                WhatsApp-এ অর্ডার করুন
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16">
          <Reveal>
            <h2 className="font-bserif text-2xl font-bold text-ink">একই ধরনের প্রোডাক্ট</h2>
          </Reveal>
          <Stagger className="mt-6 grid grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </Stagger>
        </section>
      ) : null}

      {/* Mobile sticky buy bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl gap-2.5">
          {inStock ? (
            <Link
              href={`/checkout?slug=${product.slug}`}
              className="flex h-12 flex-1 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-soft"
            >
              অর্ডার করুন (ক্যাশ অন ডেলিভারি)
            </Link>
          ) : (
            <span className="flex h-12 flex-1 cursor-not-allowed items-center justify-center rounded-full bg-blush text-sm font-semibold text-ink-soft">
              স্টক শেষ
            </span>
          )}
          {settings.whatsapp_number ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp-এ অর্ডার করুন"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success text-white"
            >
              <MessageCircle size={22} />
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
