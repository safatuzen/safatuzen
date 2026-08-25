"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, createAdminClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";
import type { OrderStatus, StoreSettings } from "@/lib/types";

/** Authoritative guard for every mutation. */
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return user;
}

function admin() {
  if (!hasSupabaseEnv()) throw new Error("Supabase env vars are not set");
  return createAdminClient();
}

function refreshStorefront() {
  revalidatePath("/", "layout");
}

/* ---------------- products ---------------- */

export interface ProductInput {
  id?: string;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  category: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  warranty_months: number | null;
}

export async function saveProduct(input: ProductInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireAdmin();

  if (!input.name.trim()) return { ok: false, error: "প্রোডাক্টের নাম দিন" };
  if (!(input.price > 0)) return { ok: false, error: "সঠিক দাম দিন" };

  const slug = slugify(input.slug || input.name_en || input.name) || `product-${Date.now()}`;
  const row = {
    name: input.name.trim(),
    name_en: input.name_en.trim() || null,
    slug,
    description: input.description.trim() || null,
    features: input.features.filter((f) => f.trim()),
    specs: input.specs.filter((s) => s.label.trim() && s.value.trim()),
    category: input.category,
    price: input.price,
    compare_at_price: input.compare_at_price && input.compare_at_price > 0 ? input.compare_at_price : null,
    stock: Math.max(0, Math.round(input.stock)),
    is_featured: input.is_featured,
    is_active: input.is_active,
    warranty_months: input.warranty_months && input.warranty_months > 0 ? Math.round(input.warranty_months) : null,
  };

  try {
    const db = admin();
    if (input.id) {
      const { error } = await db.from("products").update(row).eq("id", input.id);
      if (error) return { ok: false, error: error.message };
      refreshStorefront();
      return { ok: true, id: input.id };
    }
    const { data, error } = await db.from("products").insert(row).select("id").single();
    if (error) return { ok: false, error: error.message };
    refreshStorefront();
    return { ok: true, id: data.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export async function deleteProduct(productId: string) {
  await requireAdmin();
  const db = admin();

  // Remove the storage folder first, then rely on cascade for rows.
  const { data: objects } = await db
    .from("product_images")
    .select("url")
    .eq("product_id", productId);

  if (objects && objects.length > 0) {
    const paths = objects
      .map((o: { url: string }) => decodeURIComponent(o.url.split("/product-images/")[1] ?? ""))
      .filter(Boolean);
    if (paths.length > 0) {
      await db.storage.from("product-images").remove(paths);
    }
  }

  const { error } = await db.from("products").delete().eq("id", productId);
  if (!error) refreshStorefront();
  return { ok: !error };
}

export async function setProductFlag(
  productId: string,
  field: "is_active" | "is_featured",
  value: boolean,
) {
  await requireAdmin();
  const db = admin();
  const { error } = await db.from("products").update({ [field]: value }).eq("id", productId);
  if (!error) refreshStorefront();
  return { ok: !error };
}

/* ---------------- product images ---------------- */

export async function uploadProductImage(
  productId: string,
  formData: FormData,
): Promise<{ ok: boolean; url?: string; id?: string; error?: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "No file provided" };

  try {
    const db = admin();
    const ext = file.type === "image/png" ? "png" : "webp";
    const path = `products/${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await db.storage
      .from("product-images")
      .upload(path, await file.arrayBuffer(), { contentType: file.type });

    if (error) return { ok: false, error: error.message };

    const { data } = db.storage.from("product-images").getPublicUrl(path);
    const url = data.publicUrl;

    const { data: existing } = await db
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1);

    const { data: inserted } = await db
      .from("product_images")
      .insert({
        product_id: productId,
        url,
        sort_order: (existing?.[0]?.sort_order ?? -1) + 1,
      })
      .select("id")
      .single();

    refreshStorefront();
    return { ok: true, url, id: inserted?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Upload failed" };
  }
}

export async function deleteProductImage(imageId: string) {
  await requireAdmin();
  const db = admin();
  const { data: img } = await db.from("product_images").select("url").eq("id", imageId).maybeSingle();
  const path = img ? decodeURIComponent(img.url.split("/product-images/")[1] ?? "") : "";
  if (path) await db.storage.from("product-images").remove([path]);
  const { error } = await db.from("product_images").delete().eq("id", imageId);
  if (!error) refreshStorefront();
  return { ok: !error };
}

export async function reorderProductImages(productId: string, orderedIds: string[]) {
  await requireAdmin();
  const db = admin();
  await Promise.all(
    orderedIds.map((id, i) =>
      db.from("product_images").update({ sort_order: i }).eq("id", id),
    ),
  );
  void productId;
  refreshStorefront();
  return { ok: true };
}

/* ---------------- orders ---------------- */

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();
  const db = admin();
  const { error } = await db.from("orders").update({ status }).eq("id", orderId);
  return { ok: !error };
}

/* ---------------- reviews ---------------- */

export interface ReviewInput {
  id?: string;
  customer_name: string;
  quote: string;
  rating: number;
  photo_url: string | null;
  is_published: boolean;
}

export async function saveReview(input: ReviewInput) {
  await requireAdmin();
  const db = admin();
  const row = {
    customer_name: input.customer_name.trim(),
    quote: input.quote.trim(),
    rating: Math.min(5, Math.max(1, Math.round(input.rating))),
    photo_url: input.photo_url,
    is_published: input.is_published,
  };
  if (!row.customer_name || !row.quote) return { ok: false, error: "নাম ও মতামত লিখুন" };

  const { error } = input.id
    ? await db.from("reviews").update(row).eq("id", input.id)
    : await db.from("reviews").insert(row);
  if (!error) refreshStorefront();
  return { ok: !error };
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const db = admin();
  const { error } = await db.from("reviews").delete().eq("id", id);
  if (!error) refreshStorefront();
  return { ok: !error };
}

/* ---------------- settings ---------------- */

export async function saveSettings(s: StoreSettings) {
  await requireAdmin();
  const db = admin();
  const { error } = await db
    .from("store_settings")
    .update({
      whatsapp_number: s.whatsapp_number.replace(/[^\d+]/g, ""),
      messenger_url: s.messenger_url,
      instagram_url: s.instagram_url,
      email: s.email,
      delivery_dhaka: s.delivery_dhaka,
      delivery_outside: s.delivery_outside,
      announcement: s.announcement,
      hero_product_id: s.hero_product_id || null,
    })
    .eq("id", 1);
  if (!error) refreshStorefront();
  return { ok: !error };
}
