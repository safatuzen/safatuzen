import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Category } from "@/lib/types";
import { ProductForm } from "@/components/admin/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: product }, { data: images }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_images").select("*").eq("product_id", id).order("sort_order"),
  ]);

  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="text-sm text-primary hover:text-primary-deep">
        ← সব প্রোডাক্ট
      </Link>
      <h1 className="mb-6 mt-2 font-bserif text-2xl font-bold text-ink">{product.name}</h1>
      <ProductForm
        initial={{
          id: product.id,
          name: product.name,
          name_en: product.name_en ?? "",
          slug: product.slug,
          description: product.description ?? "",
          features: (product.features as string[])?.length ? (product.features as string[]) : [""],
          specs: (product.specs as { label: string; value: string }[]) ?? [],
          category: product.category as Category,
          price: String(product.price),
          compare_at_price: product.compare_at_price ? String(product.compare_at_price) : "",
          stock: String(product.stock),
          is_featured: Boolean(product.is_featured),
          is_active: Boolean(product.is_active),
          warranty_months: product.warranty_months ? String(product.warranty_months) : "",
        }}
        initialImages={(images ?? []).map((i) => ({ id: i.id, url: i.url }))}
      />
    </div>
  );
}
