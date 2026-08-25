import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { BD_PHONE_REGEX } from "@/lib/utils";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().regex(BD_PHONE_REGEX),
  address: z.string().trim().min(10).max(1000),
  area: z.enum(["dhaka", "outside"]),
  note: z.string().max(500).optional().or(z.literal("")),
  website: z.string().max(0), // honeypot
  items: z
    .array(z.object({ product_id: z.string().uuid(), qty: z.number().int().min(1).max(99) }))
    .min(1)
    .max(5),
});

// Naive in-memory rate limit: max 5 order posts / minute / IP (per instance).
const hits = new Map<string, { count: number; reset: number }>();

function tooManyRequests(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.reset < now) {
    hits.set(ip, { count: 1, reset: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > 5;
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json(
      { ok: false, error: "Store is not configured yet. Set Supabase env vars." },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";
  if (tooManyRequests(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "অনুগ্রহ করে সব তথ্য সঠিকভাবে দিন।" }, { status: 400 });
  }
  const data = parsed.data;

  // Prices/delivery are computed server-side from the DB — never trust the client.
  const supabase = await createClient();
  const ids = data.items.map((i) => i.product_id);
  const { data: products, error } = await supabase
    .from("products")
    .select("id, price, is_active")
    .in("id", ids);

  if (error || !products || products.length !== ids.length) {
    return NextResponse.json({ ok: false, error: "প্রোডাক্ট খুঁজে পাওয়া যায়নি।" }, { status: 400 });
  }
  if (products.some((p: { is_active: boolean }) => !p.is_active)) {
    return NextResponse.json({ ok: false, error: "এই প্রোডাক্টটি এখন বিক্রির জন্য নেই।" }, { status: 400 });
  }

  const { data: settingsRow } = await supabase
    .from("store_settings")
    .select("delivery_dhaka, delivery_outside")
    .eq("id", 1)
    .maybeSingle();

  const deliveryCharge =
    data.area === "dhaka"
      ? Number(settingsRow?.delivery_dhaka ?? 60)
      : Number(settingsRow?.delivery_outside ?? 120);

  const subtotal = products.reduce((sum: number, p: { id: string; price: number }) => {
    const item = data.items.find((i) => i.product_id === p.id)!;
    return sum + Number(p.price) * item.qty;
  }, 0);
  const total = subtotal + deliveryCharge;

  // Insert with service role so we can read back the generated order_no.
  const admin = createAdminClient();
  const { data: order, error: insertErr } = await admin
    .from("orders")
    .insert({
      customer_name: data.name,
      phone: data.phone,
      address: data.address,
      area: data.area,
      delivery_charge: deliveryCharge,
      total,
      note: data.note || null,
      status: "new",
    })
    .select("order_no, id")
    .single();

  if (insertErr || !order) {
    console.error("[orders] insert failed", insertErr);
    return NextResponse.json(
      { ok: false, error: "সার্ভারে সমস্যা হয়েছে। একটু পরে আবার চেষ্টা করুন।" },
      { status: 500 },
    );
  }

  const { data: productRows } = await supabase.from("products").select("id, name").in("id", ids);
  const itemsToInsert = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name:
      productRows?.find((p: { id: string }) => p.id === item.product_id)?.name ?? "প্রোডাক্ট",
    unit_price: Number(products.find((p: { id: string }) => p.id === item.product_id)!.price),
    qty: item.qty,
  }));
  await admin.from("order_items").insert(itemsToInsert);

  return NextResponse.json({ ok: true, order_no: order.order_no });
}
