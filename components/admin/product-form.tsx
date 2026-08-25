"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GripVertical, Plus, X } from "lucide-react";
import { CATEGORY_LABELS, type Category } from "@/lib/types";
import { slugify } from "@/lib/utils";
import { PriceBlock } from "@/components/price-block";
import {
  deleteProductImage,
  reorderProductImages,
  saveProduct,
  uploadProductImage,
} from "@/lib/actions";

export interface ProductFormValues {
  id?: string;
  name: string;
  name_en: string;
  slug: string;
  description: string;
  features: string[];
  specs: { label: string; value: string }[];
  category: Category;
  price: string;
  compare_at_price: string;
  stock: string;
  is_featured: boolean;
  is_active: boolean;
  warranty_months: string;
}

export interface InitialImage {
  id: string;
  url: string;
}

/** Client-side downscale to max 1600px and convert to WebP before upload. */
async function resizeToWebP(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/webp", 0.85),
  );
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
}

export function ProductForm({
  initial,
  initialImages = [],
}: {
  initial?: Partial<ProductFormValues> & { id?: string };
  initialImages?: InitialImage[];
}) {
  const router = useRouter();
  const productId = initial?.id;

  const [values, setValues] = useState<ProductFormValues>({
    id: productId,
    name: initial?.name ?? "",
    name_en: initial?.name_en ?? "",
    slug: initial?.slug ?? "",
    description: initial?.description ?? "",
    features: initial?.features ?? [""],
    specs: initial?.specs ?? [],
    category: initial?.category ?? "grooming",
    price: initial?.price ?? "",
    compare_at_price: initial?.compare_at_price ?? "",
    stock: initial?.stock ?? "10",
    is_featured: initial?.is_featured ?? false,
    is_active: initial?.is_active ?? true,
    warranty_months: initial?.warranty_months ?? "",
  });

  const [images, setImages] = useState<InitialImage[]>(initialImages);
  const [uploading, setUploading] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  function set<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSave(): Promise<string | undefined> {
    setError(null);
    if (!values.name.trim()) throw new Error("প্রোডাক্টের নাম লিখুন");
    if (!(Number(values.price) > 0)) throw new Error("সঠিক দাম দিন");

    const result = await saveProduct({
      id: values.id,
      name: values.name,
      name_en: values.name_en,
      slug: values.slug || slugify(values.name_en || values.name),
      description: values.description,
      features: values.features.filter((f) => f.trim()),
      specs: values.specs.filter((s) => s.label.trim() || s.value.trim()),
      category: values.category,
      price: Number(values.price),
      compare_at_price: values.compare_at_price ? Number(values.compare_at_price) : null,
      stock: Number(values.stock || 0),
      is_featured: values.is_featured,
      is_active: values.is_active,
      warranty_months: values.warranty_months ? Number(values.warranty_months) : null,
    });
    if (!result.ok) throw new Error(result.error ?? "সেভ করা যায়নি");
    return result.id;
  }

  async function onSave(closeAfter: boolean) {
    try {
      setSaving(true);
      const id = await handleSave();
      if (!values.id && id) {
        setValues((v) => ({ ...v, id }));
        router.replace(`/admin/products/${id}`);
      }
      showToast("সেভ হয়েছে ✅");
      router.refresh();
      if (closeAfter) router.push("/admin/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "সমস্যা হয়েছে");
    } finally {
      setSaving(false);
    }
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files || !productId) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      setUploading(file.name);
      try {
        const resized = await resizeToWebP(file);
        const fd = new FormData();
        fd.set("file", resized);
        const res = await uploadProductImage(productId!, fd);
        if (!res.ok || !res.url || !res.id) {
          setError(res.error ?? "ছবি আপলোড হয়নি");
        } else {
          setImages((imgs) => [...imgs, { id: res.id!, url: res.url! }]);
        }
      } catch {
        setError("ছবি প্রসেস করা যায়নি — আবার চেষ্টা করুন।");
      }
    }
    setUploading(null);
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setImages(next);
    void reorderProductImages(
      productId!,
      next.map((i) => i.id),
    );
  }

  return (
    <div className="space-y-6">
      {/* ---------- ছবি ---------- */}
      <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
        <h2 className="font-semibold text-ink">১. ছবি</h2>
        {!productId ? (
          <p className="mt-3 rounded-xl bg-blush p-3 text-sm text-primary-deep">
            ছবি যোগ করতে আগে “সেভ করুন” চাপুন — এরপরই আপলোড চালু হবে।
          </p>
        ) : (
          <>
            <div className="mt-3 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => (dragIndex.current = i)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragIndex.current !== null) moveImage(dragIndex.current, i);
                    dragIndex.current = null;
                  }}
                  className="group relative"
                >
                  <div className="relative h-24 w-24 overflow-hidden rounded-2xl border border-hairline bg-blush">
                    <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
                  </div>
                  <span className="absolute left-1 top-1 cursor-grab rounded-full bg-surface/90 p-1 text-ink-soft" aria-hidden>
                    <GripVertical size={14} />
                  </span>
                  <button
                    type="button"
                    aria-label="ছবি মুছুন"
                    onClick={async () => {
                      if (!window.confirm("এই ছবিটি মুছে ফেলবেন?")) return;
                      await deleteProductImage(img.id);
                      setImages((arr) => arr.filter((x) => x.id !== img.id));
                    }}
                    className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-danger text-white shadow"
                  >
                    <X size={14} />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium text-white">
                      কভার
                    </span>
                  )}
                </div>
              ))}
              <label
                className={`flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-hairline text-xs text-ink-soft hover:border-primary hover:text-primary ${
                  uploading ? "animate-pulse" : ""
                }`}
              >
                <Plus size={20} />
                {uploading ? "আপলোড হচ্ছে..." : "ছবি যোগ"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => void onFilesSelected(e.target.files)}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-ink-soft">
              টেনে (drag) সাজান · প্রথম ছবিটি কভার হবে · আপলোডের আগে স্বয়ংক্রিয়ভাবে ছোট ও WebP হয়ে যায়
            </p>
          </>
        )}
      </section>

      {/* ---------- নাম ও মডেল ---------- */}
      <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
        <h2 className="font-semibold text-ink">২. নাম ও মডেল</h2>
        <Field label="প্রোডাক্টের নাম (বাংলা)" required>
          <input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="যেমন: ৫-ইন-১ মাল্টিফাংশনাল বিউটি কিট"
            className={inputCls}
          />
        </Field>
        <Field label="English / Model নাম">
          <input
            value={values.name_en}
            onChange={(e) => {
              set("name_en", e.target.value);
              if (!values.id) set("slug", slugify(e.target.value));
            }}
            placeholder="MS-8377"
            className={inputCls}
          />
        </Field>
        <Field label="Slug (লিংক)">
          <input
            value={values.slug}
            onChange={(e) => set("slug", e.target.value)}
            placeholder="auto-generated-from-name"
            className={`${inputCls} font-poppins text-sm`}
          />
        </Field>
      </section>

      {/* ---------- দাম ---------- */}
      <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
        <h2 className="font-semibold text-ink">৩. দাম</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="বর্তমান দাম (৳)" required>
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="1450"
              className={`${inputCls} font-poppins`}
            />
          </Field>
          <Field label="আগের দাম (৳)">
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={values.compare_at_price}
              onChange={(e) => set("compare_at_price", e.target.value)}
              placeholder="ঐচ্ছিক"
              className={`${inputCls} font-poppins`}
            />
            <p className="mt-1 text-xs text-ink-soft">আগের দাম দিলে ডিস্কাউন্ট ব্যাজ দেখাবে</p>
          </Field>
        </div>
        <div className="mt-4 rounded-2xl bg-blush/60 p-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">কাস্টমার যা দেখবে:</p>
          {Number(values.price) > 0 ? (
            <PriceBlock
              price={Number(values.price)}
              compareAtPrice={values.compare_at_price ? Number(values.compare_at_price) : null}
              size="lg"
            />
          ) : (
            <p className="text-sm text-ink-soft">দাম লিখলে এখানে প্রিভিউ দেখা যাবে</p>
          )}
        </div>
      </section>

      {/* ---------- ক্যাটাগরি ও স্টক ---------- */}
      <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
        <h2 className="font-semibold text-ink">৪. ক্যাটাগরি ও স্টক</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="ক্যাটাগরি">
            <select
              value={values.category}
              onChange={(e) => set("category", e.target.value as Category)}
              className={inputCls}
            >
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </Field>
          <Field label="স্টক (পিস)">
            <input
              type="number"
              min="0"
              value={values.stock}
              onChange={(e) => set("stock", e.target.value)}
              className={`${inputCls} font-poppins`}
            />
          </Field>
          <Field label="ওয়ারেন্টি (মাস)">
            <input
              type="number"
              min="0"
              value={values.warranty_months}
              onChange={(e) => set("warranty_months", e.target.value)}
              placeholder="যেমন: ৬ (না থাকলে খালি)"
              className={`${inputCls} font-poppins`}
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-6">
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={values.is_active} onChange={(e) => set("is_active", e.target.checked)} className="h-5 w-5 accent-[var(--primary)]" />
            শোকেসে দেখান
          </label>
          <label className="flex items-center gap-2.5 text-sm text-ink">
            <input type="checkbox" checked={values.is_featured} onChange={(e) => set("is_featured", e.target.checked)} className="h-5 w-5 accent-[var(--primary)]" />
            ফিচার্ড (হোমপেজে দেখাবে)
          </label>
        </div>
      </section>

      {/* ---------- বিবরণ ও ফিচার ---------- */}
      <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
        <h2 className="font-semibold text-ink">৫. বিবরণ ও ফিচার</h2>
        <Field label="বিবরণ">
          <textarea
            rows={4}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="প্রোডাক্টটি সম্পর্কে বাংলায় লিখুন..."
            className={`${inputCls} leading-relaxed`}
          />
        </Field>

        <p className="mt-4 mb-2 text-sm font-medium text-ink">ফিচার (★ বুলেট)</p>
        <div className="space-y-2">
          {values.features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={f}
                onChange={(e) =>
                  set("features", values.features.map((x, j) => (j === i ? e.target.value : x)))
                }
                placeholder="★ ফিচার লিখুন"
                className={inputCls}
              />
              <button
                type="button"
                aria-label="ফিচার মুছুন"
                onClick={() => set("features", values.features.filter((_, j) => j !== i))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush text-danger"
              >
                −
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("features", [...values.features, ""])}
            className="min-h-[44px] rounded-full bg-blush px-5 text-sm font-medium text-primary-deep hover:bg-primary hover:text-white"
          >
            + ফিচার যোগ করুন
          </button>
        </div>

        <p className="mt-5 mb-2 text-sm font-medium text-ink">স্পেসিফিকেশন (ঐচ্ছিক)</p>
        <div className="space-y-2">
          {values.specs.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={s.label}
                onChange={(e) =>
                  set("specs", values.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                }
                placeholder="বিষয়"
                className={`${inputCls} max-w-[40%]`}
              />
              <input
                value={s.value}
                onChange={(e) =>
                  set("specs", values.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))
                }
                placeholder="বিবরণ"
                className={inputCls}
              />
              <button
                type="button"
                aria-label="স্পেসিফিকেশন মুছুন"
                onClick={() => set("specs", values.specs.filter((_, j) => j !== i))}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blush text-danger"
              >
                −
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => set("specs", [...values.specs, { label: "", value: "" }])}
            className="min-h-[44px] rounded-full bg-blush px-5 text-sm font-medium text-primary-deep hover:bg-primary hover:text-white"
          >
            + স্পেসিফিকেশন যোগ করুন
          </button>
        </div>
      </section>

      {error && (
        <p role="alert" className="rounded-2xl bg-danger/10 p-4 text-sm font-medium text-danger">{error}</p>
      )}

      <div className="sticky bottom-16 z-30 flex gap-3 md:bottom-4">
        <button
          type="button"
          disabled={saving}
          onClick={() => void onSave(true)}
          className="h-12 flex-1 rounded-full bg-primary font-semibold text-white shadow-lift transition-colors hover:bg-primary-deep disabled:opacity-60 sm:flex-none sm:px-10"
        >
          {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </button>
        {productId && (
          <button
            type="button"
            disabled={saving}
            onClick={() => void onSave(false)}
            className="hidden h-12 rounded-full border border-primary/40 px-6 font-semibold text-primary hover:bg-blush sm:block"
          >
            সেভ ও এডিট রাখুন
          </button>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white shadow-lift md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-2xl border border-hairline bg-bg px-4 text-ink outline-none transition-colors focus:border-primary";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">
        {label} {required && <span className="text-danger">*</span>}
      </span>
      {children}
    </label>
  );
}
