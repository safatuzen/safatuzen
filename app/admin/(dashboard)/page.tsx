import Link from "next/link";
import { Package, ShoppingCart, Star, AlertTriangle, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABELS } from "@/lib/types";
import { formatBDT, timeAgoBn } from "@/lib/utils";

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [ordersRes, productsRes, reviewsRes] = await Promise.all([
    supabase.from("orders").select("id").eq("status", "new"),
    supabase.from("products").select("id"),
    supabase.from("reviews").select("id"),
  ]);
  const [lowStockRes, recentOrdersRes] = await Promise.all([
    supabase.from("products").select("id,name,stock").lt("stock", 5).gt("stock", -1).order("stock"),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(6),
  ]);

  const isTableMissing =
    ordersRes.error?.code === "PGRST205" ||
    productsRes.error?.code === "PGRST205" ||
    reviewsRes.error?.code === "PGRST205";

  const tiles = [
    { label: "নতুন অর্ডার", value: ordersRes.data?.length ?? 0, icon: ShoppingCart, href: "/admin/orders" },
    { label: "মোট প্রোডাক্ট", value: productsRes.data?.length ?? 0, icon: Package, href: "/admin/products" },
    {
      label: "স্টক শেষ হওয়ার পথে",
      value: lowStockRes.data?.length ?? 0,
      icon: AlertTriangle,
      href: "/admin/products",
      warn: (lowStockRes.data?.length ?? 0) > 0,
    },
    { label: "মোট রিভিউ", value: reviewsRes.data?.length ?? 0, icon: Star, href: "/admin/reviews" },
  ];

  return (
    <div>
      {isTableMissing && (
        <div className="mb-6 rounded-3xl border border-accent/40 bg-accent/10 p-6 shadow-soft">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 shrink-0 text-accent" size={24} />
            <div>
              <h3 className="font-bold text-ink">Supabase ডাটাবেস সেটআপ প্রয়োজন / Database Migration Required</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                আপনার Supabase প্রজেক্টে এখনো টেবিলসমূহ (products, orders, reviews, store_settings) তৈরি করা হয়নি।
              </p>
              <div className="mt-3 rounded-2xl bg-surface p-4 text-xs font-mono text-ink border border-hairline">
                1. Open <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-primary underline">Supabase Dashboard</a> → SQL Editor<br />
                2. Copy &amp; Paste all code from file: <code className="font-bold text-primary">supabase/migration.sql</code><br />
                3. Click <strong>Run</strong> button.
              </div>
            </div>
          </div>
        </div>
      )}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-bserif text-2xl font-bold text-ink">ড্যাশবোর্ড</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-soft hover:bg-primary-deep"
        >
          <Plus size={18} /> নতুন প্রোডাক্ট
        </Link>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className={`rounded-3xl border p-5 shadow-soft transition-shadow hover:shadow-lift ${
              t.warn ? "border-danger/30 bg-danger/5" : "border-hairline bg-surface"
            }`}
          >
            <t.icon size={20} className={t.warn ? "text-danger" : "text-primary"} />
            <p className="mt-2 font-poppins text-3xl font-bold text-ink">{t.value}</p>
            <p className="mt-0.5 text-xs leading-snug text-ink-soft">{t.label}</p>
          </Link>
        ))}
      </div>

      <section className="mt-7 rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">সাম্প্রতিক অর্ডার</h2>
          <Link href="/admin/orders" className="text-sm font-medium text-primary hover:text-primary-deep">
            সব দেখুন →
          </Link>
        </div>

        {recentOrdersRes.data && recentOrdersRes.data.length > 0 ? (
          <ul className="mt-3 divide-y divide-blush">
            {recentOrdersRes.data.map((o) => (
              <li key={o.id} className="flex min-h-[56px] items-center gap-3 py-2.5">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 font-poppins text-xs font-bold text-primary-deep">
                  {o.order_no}
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{o.customer_name}</span>
                <span className="hidden font-poppins text-sm text-primary sm:inline">{formatBDT(o.total)}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    o.status === "new"
                      ? "bg-accent/15 text-accent"
                      : o.status === "delivered"
                        ? "bg-success/15 text-success"
                        : o.status === "cancelled"
                          ? "bg-danger/10 text-danger"
                          : "bg-blush text-primary-deep"
                  }`}
                >
                  {ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS]}
                </span>
                <span className="w-24 shrink-0 text-right text-xs text-ink-soft">{timeAgoBn(o.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-hairline p-8 text-center text-sm text-ink-soft">
            এখনো কোনো অর্ডার আসেনি। প্রথম অর্ডারটি এলেই এখানে দেখা যাবে!
          </p>
        )}
      </section>
    </div>
  );
}
