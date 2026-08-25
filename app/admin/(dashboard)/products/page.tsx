import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { CATEGORY_LABELS } from "@/lib/types";
import { formatBDT } from "@/lib/utils";
import { ProductFlagToggle, ProductDeleteAction } from "@/components/admin/controls";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*, product_images(id, url, sort_order)")
    .order("created_at", { ascending: false });

  const rows = products ?? [];

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-bserif text-2xl font-bold text-ink">প্রোডাক্ট</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-soft hover:bg-primary-deep"
        >
          <Plus size={18} /> নতুন প্রোডাক্ট
        </Link>
      </header>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-dashed border-hairline bg-surface p-10 text-center text-sm leading-relaxed text-ink-soft">
          এখনো কোনো প্রোডাক্ট নেই।
          <br />
          “নতুন প্রোডাক্ট” বাটনে চেপে প্রথমটি যোগ করুন!
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((p) => {
            const images = (p.product_images ?? []) as { id: string; url: string; sort_order: number }[];
            const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);
            return (
              <li
                key={p.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-3xl border border-hairline bg-surface p-3.5 shadow-soft sm:flex-nowrap"
              >
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-blush">
                  {sorted[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={sorted[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-bserif text-xl font-bold text-primary/50">
                      {(p.name as string).trim().charAt(0)}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{p.name}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    <span className="font-poppins font-semibold text-primary">{formatBDT(p.price)}</span>
                    {" · "}
                    {CATEGORY_LABELS[p.category as keyof typeof CATEGORY_LABELS]}
                    {" · "}
                    স্টক: {p.stock}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs text-ink-soft">
                    <ProductFlagToggle
                      productId={p.id}
                      field="is_active"
                      initialValue={Boolean(p.is_active)}
                      label="শোকেসে দেখান"
                    />
                    শোকেসে
                  </label>
                  <label className="flex items-center gap-2 text-xs text-ink-soft">
                    <ProductFlagToggle
                      productId={p.id}
                      field="is_featured"
                      initialValue={Boolean(p.is_featured)}
                      label="ফিচার্ড"
                    />
                    ফিচার্ড
                  </label>
                </div>

                <div className="ml-auto flex items-center gap-1">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary hover:bg-blush"
                  >
                    <Pencil size={16} /> এডিট
                  </Link>
                  <ProductDeleteAction productId={p.id} productName={p.name} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
