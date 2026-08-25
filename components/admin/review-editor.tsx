"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { deleteReview, saveReview, type ReviewInput } from "@/lib/actions";
import { ConfirmDelete, Switch } from "@/components/admin/controls";

export function ReviewCard({ initial }: { initial: ReviewInput & { id: string } }) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  return (
    <li className="rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={values.customer_name}
          onChange={(e) => setValues((v) => ({ ...v, customer_name: e.target.value }))}
          placeholder="কাস্টমারের নাম"
          className="h-11 min-w-40 flex-1 rounded-2xl border border-hairline bg-bg px-4 outline-none focus:border-primary"
        />
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} স্টার`}
              onClick={() => setValues((v) => ({ ...v, rating: n }))}
              className="p-0.5"
            >
              <Star
                size={20}
                className={n <= values.rating ? "text-accent" : "text-blush"}
                fill="currentColor"
                strokeWidth={0}
              />
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-ink-soft">
          <Switch
            checked={values.is_published}
            label="প্রকাশিত"
            onChange={(v) => setValues((x) => ({ ...x, is_published: v }))}
          />
          প্রকাশিত
        </label>
      </div>

      <textarea
        rows={3}
        value={values.quote}
        onChange={(e) => setValues((v) => ({ ...v, quote: e.target.value }))}
        placeholder="কাস্টমারের মতামত..."
        className="mt-3 w-full rounded-2xl border border-hairline bg-bg p-4 leading-relaxed outline-none focus:border-primary"
      />

      <div className="mt-3 flex flex-wrap gap-2.5">
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            const res = await saveReview(values);
            setSaving(false);
            flash(res.ok ? "সেভ হয়েছে ✅" : "সেভ হয়নি — আবার চেষ্টা করুন");
            router.refresh();
          }}
          className="min-h-[44px] rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
        >
          {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </button>
        <ConfirmDelete
          onConfirm={async () => {
            await deleteReview(values.id);
            router.refresh();
          }}
          message="এই রিভিউটি মুছে যাবে। আপনি কি নিশ্চিত?"
        />
      </div>

      {toast && (
        <p className="mt-2 text-sm font-medium text-success">{toast}</p>
      )}
    </li>
  );
}

export function NewReviewButton() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);

  if (!creating) {
    return (
      <button
        type="button"
        onClick={() => setCreating(true)}
        className="min-h-[44px] rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-soft hover:bg-primary-deep"
      >
        + নতুন রিভিউ
      </button>
    );
  }

  return (
    <NewReviewForm onDone={() => { setCreating(false); router.refresh(); }} />
  );
}

function NewReviewForm({ onDone }: { onDone: () => void }) {
  const [values, setValues] = useState<ReviewInput>({
    customer_name: "",
    quote: "",
    rating: 5,
    photo_url: null,
    is_published: true,
  });
  const [busy, setBusy] = useState(false);

  return (
    <div className="w-full rounded-3xl border border-hairline bg-surface p-5 shadow-soft">
      <input
        value={values.customer_name}
        onChange={(e) => setValues((v) => ({ ...v, customer_name: e.target.value }))}
        placeholder="কাস্টমারের নাম"
        className="h-11 w-full rounded-2xl border border-hairline bg-bg px-4 outline-none focus:border-primary"
      />
      <textarea
        rows={3}
        value={values.quote}
        onChange={(e) => setValues((v) => ({ ...v, quote: e.target.value }))}
        placeholder="মতামত লিখুন..."
        className="mt-3 w-full rounded-2xl border border-hairline bg-bg p-4 leading-relaxed outline-none focus:border-primary"
      />
      <div className="mt-3 flex flex-wrap gap-2.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} স্টার`} onClick={() => setValues((v) => ({ ...v, rating: n }))}>
            <Star size={20} className={n <= values.rating ? "text-accent" : "text-blush"} fill="currentColor" strokeWidth={0} />
          </button>
        ))}
      </div>
      <div className="mt-4 flex gap-2.5">
        <button
          type="button"
          disabled={busy || !values.customer_name.trim() || !values.quote.trim()}
          onClick={async () => {
            setBusy(true);
            await saveReview(values);
            setBusy(false);
            onDone();
          }}
          className="min-h-[44px] rounded-full bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-deep disabled:opacity-60"
        >
          {busy ? "যোগ হচ্ছে..." : "যোগ করুন"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="min-h-[44px] rounded-full border border-hairline px-5 text-sm font-medium text-ink-soft"
        >
          বাতিল
        </button>
      </div>
    </div>
  );
}
