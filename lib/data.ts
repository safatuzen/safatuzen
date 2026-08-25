import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";
import {
  DEFAULT_SETTINGS,
  type Product,
  type ProductWithImages,
  type Review,
  type StoreSettings,
} from "@/lib/types";

/**
 * All public reads go through these safe helpers: they never throw and fall
 * back to empty defaults so pages prerender cleanly even before env vars /
 * seed data exist. Public pages use ISR (revalidate = 60).
 */

export async function getSettings(): Promise<StoreSettings> {
  if (!hasSupabaseEnv()) return DEFAULT_SETTINGS;
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
    return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getActiveProducts(): Promise<Product[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    return (data as Product[]) ?? [];
  } catch {
    return [];
  }
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const products = await getActiveProducts();
  const featured = products.filter((p) => p.is_featured);
  return (featured.length > 0 ? featured : products).slice(0, limit);
}

export async function getProductSlugs(): Promise<string[]> {
  const products = await getActiveProducts();
  return products.map((p) => p.slug);
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  if (!hasSupabaseEnv()) return null;
  try {
    const supabase = await createClient();
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (!product) return null;
    const { data: images } = await supabase
      .from("product_images")
      .select("*")
      .eq("product_id", product.id)
      .order("sort_order");
    return { ...(product as Product), images: (images ?? []) as ProductWithImages["images"] };
  } catch {
    return null;
  }
}

export async function getRelatedProducts(
  category: string,
  excludeId: string,
  limit = 4,
): Promise<Product[]> {
  const products = await getActiveProducts();
  return products
    .filter((p) => p.category === category && p.id !== excludeId)
    .slice(0, limit);
}

export async function getPublishedReviews(): Promise<Review[]> {
  if (!hasSupabaseEnv()) return [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("reviews")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    return (data as Review[]) ?? [];
  } catch {
    return [];
  }
}
