import { discountPercent, formatBDT, toBn } from "@/lib/utils";

export function PriceBlock({
  price,
  compareAtPrice,
  size = "md",
}: {
  price: number;
  compareAtPrice?: number | null;
  size?: "md" | "lg";
}) {
  const off = discountPercent(price, compareAtPrice ?? null);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span
        className={`font-poppins font-semibold text-primary ${
          size === "lg" ? "text-3xl" : "text-lg"
        }`}
      >
        {formatBDT(price)}
      </span>
      {compareAtPrice ? (
        <span
          className={`font-poppins text-ink-soft line-through ${
            size === "lg" ? "text-lg" : "text-sm"
          }`}
        >
          {formatBDT(compareAtPrice)}
        </span>
      ) : null}
      {off !== null ? (
        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-poppins text-xs font-semibold text-accent">
          -{toBn(off)}%
        </span>
      ) : null}
    </div>
  );
}
