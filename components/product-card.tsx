import Link from "next/link";
import { CATEGORY_LABELS, type Product } from "@/lib/types";
import { PriceBlock } from "@/components/price-block";
import { ProductImageFrame } from "@/components/product-image-frame";
import { StaggerItem } from "@/components/motion";

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stock > 0;

  return (
    <StaggerItem>
      <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-hairline bg-surface shadow-soft transition-shadow hover:shadow-lift">
        <div className="relative">
          <Link href={`/product/${product.slug}`} aria-label={product.name}>
            <ProductImageFrame
              name={product.name}
              className="aspect-square w-full rounded-none"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          </Link>
          <span className="absolute left-3 top-3 rounded-full bg-blush px-2.5 py-1 text-[11px] font-medium text-primary-deep">
            {CATEGORY_LABELS[product.category]}
          </span>
        </div>

        <div className="flex grow flex-col gap-1.5 p-3.5">
          <Link href={`/product/${product.slug}`} className="line-clamp-2 min-h-[3rem] font-medium leading-relaxed text-ink hover:text-primary">
            {product.name}
          </Link>

          <PriceBlock price={product.price} compareAtPrice={product.compare_at_price} />

          <p className={`text-xs ${inStock ? "text-success" : "text-danger"}`}>
            {inStock ? "স্টক আছে" : "স্টক শেষ"}
          </p>

          <div className="mt-auto pt-2">
            {inStock ? (
              <Link
                href={`/checkout?slug=${product.slug}`}
                className="flex h-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-deep"
              >
                অর্ডার করুন
              </Link>
            ) : (
              <span className="flex h-11 cursor-not-allowed items-center justify-center rounded-full bg-blush text-sm font-semibold text-ink-soft">
                স্টক শেষ
              </span>
            )}
          </div>
        </div>
      </article>
    </StaggerItem>
  );
}
