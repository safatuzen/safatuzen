import Image from "next/image";
import type { ProductImage } from "@/lib/types";

/**
 * Renders the first available product photo inside a blush frame; when the
 * owner hasn't uploaded photos yet it shows an elegant initial-letter frame —
 * never a broken image, never a stock photo.
 */
export function ProductImageFrame({
  images,
  name,
  className = "",
  sizes = "(max-width: 768px) 100vw, 400px",
  priority = false,
}: {
  images?: Pick<ProductImage, "url">[] | null;
  name: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const cover = images && images.length > 0 ? images[0].url : null;

  if (cover) {
    return (
      <div className={`relative overflow-hidden rounded-2xl bg-blush ${className}`}>
        <Image
          src={cover}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-2xl border border-hairline bg-gradient-to-br from-blush to-[#f8d9e6] ${className}`}
      aria-label={name}
    >
      <span className="select-none font-bserif text-6xl font-bold text-primary/60 sm:text-7xl">
        {name.trim().charAt(0)}
      </span>
      <span className="absolute bottom-3 right-4 text-[10px] uppercase tracking-widest text-ink-soft/70">
        SafaTu Zen
      </span>
    </div>
  );
}
