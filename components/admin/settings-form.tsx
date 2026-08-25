"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StoreSettings } from "@/lib/types";
import { saveSettings } from "@/lib/actions";

export function SettingsForm({ initial, products }: { initial: StoreSettings; products: { id: string; name: string }[] }) {
  const router = useRouter();
  const [values, setValues] = useState<StoreSettings>(initial);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function set<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);
        const res = await saveSettings(values);
        setSaving(false);
        setToast(res.ok ? "সেভ হয়েছে ✅" : "সেভ হয়নি — আবার চেষ্টা করুন");
        setTimeout(() => setToast(null), 2500);
        router.refresh();
      }}
      className="space-y-5"
    >
      <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
        <h2 className="font-semibold text-ink">ডেলিভারি চার্জ</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="ঢাকার ভিতরে (৳)" help="চেকআউট পেজে অটো-যোগ হবে">
            <input
              type="number" min="0" required
              value={values.delivery_dhaka}
              onChange={(e) => set("delivery_dhaka", Number(e.target.value))}
              className={`${inputCls} font-poppins`}
            />
          </Field>
          <Field label="ঢাকার বাইরে (৳)" help="সব জেলায় এই চার্জ দেখাবে">
            <input
              type="number" min="0" required
              value={values.delivery_outside}
              onChange={(e) => set("delivery_outside", Number(e.target.value))}
              className={`${inputCls} font-poppins`}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
        <h2 className="font-semibold text-ink">যোগাযোগ ও সোশ্যাল</h2>
        <div className="mt-3 grid gap-4">
          <Field label="WhatsApp নম্বর" help="8801XXXXXXXXX ফরম্যাটে — প্রোডাক্ট পেজের “Order on WhatsApp” বাটনে ব্যবহৃত হবে">
            <input
              value={values.whatsapp_number}
              onChange={(e) => set("whatsapp_number", e.target.value)}
              placeholder="8801XXXXXXXXX"
              className={`${inputCls} font-poppins`}
            />
          </Field>
          <Field label="Facebook Page URL" help="ফুটার ও যোগাযোগ পেজে লিংক হিসেবে দেখা যাবে">
            <input
              value={values.messenger_url}
              onChange={(e) => set("messenger_url", e.target.value)}
              className={`${inputCls} font-poppins`}
            />
          </Field>
          <Field label="Instagram URL" help="প্রোফাইল লিংক হিসেবে দেখা যাবে">
            <input
              value={values.instagram_url}
              onChange={(e) => set("instagram_url", e.target.value)}
              className={`${inputCls} font-poppins`}
            />
          </Field>
          <Field label="Store Email" help="কাস্টমার এই ঠিকানায় ইমেইল করতে পারবে">
            <input
              type="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              className={`${inputCls} font-poppins`}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
        <h2 className="font-semibold text-ink">ঘোষণা ও হোমপেজ</h2>
        <div className="mt-3 grid gap-4">
          <Field label="Announcement bar" help="সব পেজের উপরে লাল স্ট্রিপে দেখা যাবে; খালি রাখলে লুকাবে">
            <input
              value={values.announcement}
              onChange={(e) => set("announcement", e.target.value)}
              className={inputCls}
            />
          </Field>
          <Field label="হিরো প্রোডাক্ট" help="হোমপেজের ডানদিকের বড় ছবিতে যে প্রোডাক্ট দেখাবে">
            <select
              value={values.hero_product_id ?? ""}
              onChange={(e) => set("hero_product_id", e.target.value || null)}
              className={inputCls}
            >
              <option value="">অটো (ফিচার্ড থেকে)</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <button
        type="submit"
        disabled={saving}
        className="h-12 w-full rounded-full bg-primary font-semibold text-white shadow-lift hover:bg-primary-deep disabled:opacity-60 sm:w-auto sm:px-12"
      >
        {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
      </button>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-white shadow-lift md:bottom-8">
          {toast}
        </div>
      )}
    </form>
  );
}

const inputCls =
  "h-11 w-full rounded-2xl border border-hairline bg-bg px-4 text-ink outline-none transition-colors focus:border-primary";

function Field({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
      {help && <span className="mt-1 block text-xs leading-relaxed text-ink-soft">{help}</span>}
    </label>
  );
}
