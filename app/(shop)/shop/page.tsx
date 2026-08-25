import Link from "next/link";
import { getActiveProducts } from "@/lib/data";
import { CATEGORY_LABELS, type Category, type Product } from "@/lib/types";
import { ProductCard } from "@/components/product-card";
import { Stagger } from "@/components/motion";

export const revalidate = 60;

export const metadata = {
  title: "শপ",
  description: "SafaTu Zen-এর সব প্রোডাক্ট — গ্রুমিং, ওয়েলনেস, বিউটি কিট ও কিচেন।",
};

const SORTS = [
  { key: "new", label: "নতুন" },
  { key: "price-asc", label: "দাম কম → বেশি" },
  { key: "price-desc", label: "দাম বেশি → কম" },
] as const;

type SortKey = (typeof SORTS)[number]["key"];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { cat, sort } = await searchParams;
  const activeCat = typeof cat === "string" && cat in CATEGORY_LABELS ? (cat as Category) : "";
  const activeSort: SortKey =
    sort === "price-asc" || sort === "price-desc" ? sort : "new";

  const all: Product[] = await getActiveProducts();
  let products = all.filter((p) => !activeCat || p.category === activeCat);
  if (activeSort === "price-asc") products = [...products].sort((a, b) => a.price - b.price);
  if (activeSort === "price-desc") products = [...products].sort((a, b) => b.price - a.price);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="font-bserif text-3xl font-bold text-ink">শপ</h1>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto pb-1">
        <Chip href="/shop" active={!activeCat}>সব</Chip>
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
          <Chip key={c} href={`/shop?cat=${c}`} active={activeCat === c}>
            {CATEGORY_LABELS[c]}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-soft">সাজান:</span>
        {SORTS.map((s) => {
          const params = new URLSearchParams();
          if (activeCat) params.set("cat", activeCat);
          if (s.key !== "new") params.set("sort", s.key);
          const qs = params.toString();
          return (
            <Link
              key={s.key}
              href={`/shop${qs ? `?${qs}` : ""}`}
              className={`rounded-full px-3.5 py-1.5 ${
                activeSort === s.key
                  ? "bg-primary text-white"
                  : "bg-surface text-ink border border-hairline hover:text-primary"
              }`}
            >
              {s.label}
            </Link>
          );
        })}
      </div>

      {products.length > 0 ? (
        <Stagger className="mt-7 grid grid-cols-2 gap-3.5 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </Stagger>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-hairline bg-surface p-10 text-center text-sm leading-relaxed text-ink-soft">
          এই ক্যাটাগরিতে এখনো প্রোডাক্ট নেই।
          <br />
          অন্য ক্যাটাগরিতে ঘুরে দেখুন — শীঘ্রই নতুন প্রোডাক্ট আসছে!
        </p>
      )}
    </div>
  );
}

function Chip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`min-h-[40px] shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-white shadow-soft"
          : "border border-hairline bg-surface text-ink hover:border-primary hover:text-primary"
      }`}
    >
      {children}
    </Link>
  );
}
