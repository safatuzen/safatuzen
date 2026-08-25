import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { formatBDT, telLink, timeAgoBn, waLink } from "@/lib/utils";
import { OrderStatusControl } from "./status-control";

const FILTERS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "সব" },
  { key: "new", label: ORDER_STATUS_LABELS.new },
  { key: "confirmed", label: ORDER_STATUS_LABELS.confirmed },
  { key: "shipped", label: ORDER_STATUS_LABELS.shipped },
  { key: "delivered", label: ORDER_STATUS_LABELS.delivered },
  { key: "cancelled", label: ORDER_STATUS_LABELS.cancelled },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { status } = await searchParams;
  const active = typeof status === "string" && status in ORDER_STATUS_LABELS ? (status as OrderStatus) : "all";

  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(product_name, qty, unit_price)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (active !== "all") query = query.eq("status", active);
  const { data: orders } = await query;
  const rows = orders ?? [];

  return (
    <div>
      <h1 className="font-bserif text-2xl font-bold text-ink">অর্ডার</h1>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <a
            key={f.key}
            href={f.key === "all" ? "/admin/orders" : `/admin/orders?status=${f.key}`}
            className={`min-h-[40px] shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              active === f.key ? "bg-primary text-white" : "border border-hairline bg-surface text-ink"
            }`}
          >
            {f.label}
          </a>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-dashed border-hairline bg-surface p-10 text-center text-sm text-ink-soft">
          এই ফিল্টারে কোনো অর্ডার নেই। নতুন অর্ডার এলে এখানে দেখা যাবে।
        </p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((o) => (
            <li key={o.id} className="rounded-3xl border border-hairline bg-surface p-4 shadow-soft">
              <details>
                <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1.5 [&::-webkit-details-marker]:hidden">
                  <span className="rounded-full bg-blush px-2.5 py-1 font-poppins text-xs font-bold text-primary-deep">
                    {o.order_no}
                  </span>
                  <span className="font-medium text-ink">{o.customer_name}</span>
                  <a
                    href={telLink(o.phone)}
                    onClick={(e) => e.stopPropagation()}
                    className="font-poppins text-sm text-primary underline-offset-2 hover:underline"
                  >
                    {o.phone}
                  </a>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                    o.status === "delivered" ? "bg-success/15 text-success"
                    : o.status === "cancelled" ? "bg-danger/10 text-danger"
                    : o.status === "new" ? "bg-accent/15 text-accent"
                    : "bg-blush text-primary-deep"
                  }`}>
                    {ORDER_STATUS_LABELS[o.status as OrderStatus]}
                  </span>
                  <span className="ml-auto font-poppins font-semibold text-primary">{formatBDT(o.total)}</span>
                  <span className="w-full text-xs text-ink-soft sm:w-auto">
                    {o.area === "dhaka" ? "ঢাকার ভিতরে" : "ঢাকার বাইরে"} · {timeAgoBn(o.created_at)}
                  </span>
                </summary>

                <div className="mt-4 space-y-3 rounded-2xl bg-bg p-4 text-sm leading-relaxed">
                  <p><strong>ঠিকানা:</strong> {o.address}</p>
                  {o.note && <p><strong>নোট:</strong> {o.note}</p>}
                  <ul className="space-y-1">
                    {(o.order_items ?? []).map(
                      (item: { product_name: string; qty: number; unit_price: number }, i: number) => (
                      <li key={i}>
                        • {item.product_name} × {item.qty} —{" "}
                        <span className="font-poppins">{formatBDT(Number(item.unit_price) * item.qty)}</span>
                      </li>
                    ))}
                  </ul>
                  <p>
                    <strong>ডেলিভারি:</strong>{" "}
                    <span className="font-poppins">{formatBDT(Number(o.delivery_charge))}</span> ·{" "}
                    <strong>মোট:</strong>{" "}
                    <span className="font-poppins font-bold text-primary">{formatBDT(o.total)}</span>
                  </p>
                  <a
                    href={waLink(
                      o.phone,
                      `আসসালামু আলাইকুম ${o.customer_name}, আপনার অর্ডার (${o.order_no}) সম্পর্কে কথা বলছি — SafaTu Zen`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center rounded-full bg-success px-5 text-sm font-semibold text-white"
                  >
                    কাস্টমারকে WhatsApp করুন
                  </a>
                </div>

                <div className="mt-3 flex items-center gap-2.5">
                  <span className="text-xs font-medium text-ink-soft">স্টেটাস:</span>
                  <OrderStatusControl orderId={o.id} current={o.status as OrderStatus} />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
