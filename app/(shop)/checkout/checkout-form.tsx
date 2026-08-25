"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Minus, Plus } from "lucide-react";
import { BD_PHONE_REGEX, formatBDT, toBn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "অনুগ্রহ করে আপনার নাম লিখুন"),
  phone: z
    .string()
    .regex(BD_PHONE_REGEX, "১১ ডিজিটের সঠিক মোবাইল নম্বর দিন (01 দিয়ে শুরু)"),
  address: z.string().min(10, "বাসা/গ্রাম/রোডসহ পূর্ণ ঠিকানা লিখুন"),
  area: z.enum(["dhaka", "outside"]),
  note: z.string().max(500).optional(),
  website: z.string().max(0).optional(), // honeypot — humans never fill this
});

type FormValues = z.infer<typeof schema>;

export function CheckoutForm({
  product,
  delivery,
}: {
  product: { id: string; name: string; price: number; stock: number };
  delivery: { dhaka: number; outside: number };
}) {
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { area: "dhaka", note: "", website: "" },
  });

  const area = watch("area");
  const deliveryCharge = area === "dhaka" ? delivery.dhaka : delivery.outside;
  const subtotal = product.price * qty;
  const total = subtotal + (qty > 0 ? deliveryCharge : 0);

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          website: values.website ?? "",
          items: [{ product_id: product.id, qty }],
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "অর্ডার করা যায়নি");
      }
      router.replace(`/order-success?no=${encodeURIComponent(data.order_no)}`);
    } catch {
      setServerError(
        "দুঃখিত! অর্ডারটি জমা হয়নি। ইন্টারনেট সংযোগ দেখে আবার চেষ্টা করুন, অথবা WhatsApp-এ অর্ডার করুন।",
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* honeypot */}
        <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" {...register("website")} className="hidden" />

        <div>
          <label htmlFor="name" className="mb-1.5 block font-semibold text-ink">নাম *</label>
          <input
            id="name"
            {...register("name")}
            placeholder="আপনার পুরো নাম"
            className="h-12 w-full rounded-2xl border border-hairline bg-surface px-4 text-ink outline-none focus:border-primary"
          />
          {errors.name && <p className="mt-1.5 text-sm text-danger">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="phone" className="mb-1.5 block font-semibold text-ink">মোবাইল নম্বর *</label>
          <input
            id="phone"
            inputMode="numeric"
            {...register("phone")}
            placeholder="01XXXXXXXXX"
            className="h-12 w-full rounded-2xl border border-hairline bg-surface px-4 font-poppins text-ink outline-none focus:border-primary"
          />
          <p className="mt-1 text-xs text-ink-soft">এই নম্বরে আমরা অর্ডার কনফার্ম করার জন্য ফোন করব।</p>
          {errors.phone && <p className="mt-1.5 text-sm text-danger">{errors.phone.message}</p>}
        </div>

        <div>
          <label htmlFor="address" className="mb-1.5 block font-semibold text-ink">সম্পূর্ণ ঠিকানা *</label>
          <textarea
            id="address"
            rows={3}
            {...register("address")}
            placeholder="বাসা / গ্রাম, রোড, থানা, জেলা"
            className="w-full rounded-2xl border border-hairline bg-surface p-4 leading-relaxed text-ink outline-none focus:border-primary"
          />
          {errors.address && <p className="mt-1.5 text-sm text-danger">{errors.address.message}</p>}
        </div>

        <fieldset>
          <legend className="mb-1.5 block font-semibold text-ink">এলাকা *</legend>
          <div className="grid grid-cols-2 gap-3">
            <label className={`flex min-h-[56px] cursor-pointer items-center justify-between rounded-2xl border px-4 ${area === "dhaka" ? "border-primary bg-blush/60" : "border-hairline bg-surface"}`}>
              <span className="font-medium text-ink">ঢাকার ভিতরে</span>
              <input type="radio" value="dhaka" {...register("area")} className="accent-[var(--primary)]" />
            </label>
            <label className={`flex min-h-[56px] cursor-pointer items-center justify-between rounded-2xl border px-4 ${area === "outside" ? "border-primary bg-blush/60" : "border-hairline bg-surface"}`}>
              <span className="font-medium text-ink">ঢাকার বাইরে</span>
              <input type="radio" value="outside" {...register("area")} className="accent-[var(--primary)]" />
            </label>
          </div>
        </fieldset>

        <div>
          <label htmlFor="note" className="mb-1.5 block font-semibold text-ink">
            অতিরিক্ত নোট <span className="text-xs font-normal text-ink-soft">(ঐচ্ছিক)</span>
          </label>
          <textarea
            id="note"
            rows={2}
            {...register("note")}
            placeholder="যেমন: বিকালে ডেলিভারি দিলে ভালো হয়"
            className="w-full rounded-2xl border border-hairline bg-surface p-4 leading-relaxed text-ink outline-none focus:border-primary"
          />
        </div>

        {serverError && (
          <p role="alert" className="rounded-2xl bg-danger/10 p-4 text-sm leading-relaxed text-danger">
            {serverError}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || qty === 0}
          className="flex h-[56px] w-full items-center justify-center rounded-full bg-primary text-lg font-semibold text-white shadow-lift transition-colors hover:bg-primary-deep disabled:opacity-60 lg:hidden"
        >
          {submitting ? "পাঠানো হচ্ছে..." : `অর্ডার কনফার্ম করুন · ${formatBDT(total)}`}
        </button>
      </form>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-wide text-ink-soft">অর্ডার সামারি</p>

          <div className="mt-3 flex items-start justify-between gap-3">
            <p className="leading-relaxed text-ink">{product.name}</p>
            <p className="shrink-0 font-poppins font-semibold text-primary">
              {formatBDT(product.price)}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm text-ink-soft">পরিমাণ</span>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setQty((q) => {
                    const max = product.stock > 0 ? Math.min(product.stock, 99) : 99;
                    return Math.min(q + 1, max);
                  })
                }
                aria-label="পরিমাণ বাড়ান"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-primary-deep"
              >
                <Plus size={16} />
              </button>
              <span className="min-w-8 text-center font-poppins text-lg font-semibold">{toBn(qty)}</span>
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="পরিমাণ কমান"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-blush text-primary-deep"
              >
                <Minus size={16} />
              </button>
            </div>
          </div>

          <dl className="mt-4 space-y-2 border-t border-hairline pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">সাবটোটাল</dt>
              <dd className="font-poppins text-ink">{formatBDT(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">ডেলিভারি চার্জ</dt>
              <dd className="font-poppins text-ink">{formatBDT(deliveryCharge)}</dd>
            </div>
            <div className="flex justify-between border-t border-hairline pt-2.5 text-base">
              <dt className="font-semibold text-ink">সর্বমোট</dt>
              <dd className="font-poppins font-bold text-primary">{formatBDT(total)}</dd>
            </div>
          </dl>
        </div>

        <button
          type="button"
          onClick={handleSubmit(onSubmit)}
          disabled={submitting || qty === 0}
          className="hidden h-[56px] w-full items-center justify-center rounded-full bg-primary text-lg font-semibold text-white shadow-lift transition-colors hover:bg-primary-deep disabled:opacity-60 lg:flex"
        >
          {submitting ? "পাঠানো হচ্ছে..." : "অর্ডার কনফার্ম করুন"}
        </button>

        <p className="text-center text-xs leading-relaxed text-ink-soft">
          অর্ডার করলেই আমাদের টিম শীঘ্রই ফোন করবে।<br />
          কোনো অগ্রিম পেমেন্ট নেই — পণ্য হাতে পেয়ে টাকা দিন।
        </p>
      </aside>
    </div>
  );
}
