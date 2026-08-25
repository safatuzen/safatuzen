import { Star } from "lucide-react";
import { getPublishedReviews } from "@/lib/data";
import { toBn } from "@/lib/utils";

export const revalidate = 60;

export const metadata = {
  title: "হ্যাপি কাস্টমার",
  description: "SafaTu Zen-এর ক্রেতাদের সত্যিকারের অভিজ্ঞতা ও রিভিউ।",
};

export default async function ReviewsPage() {
  const reviews = await getPublishedReviews();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="text-center">
        <h1 className="font-bserif text-4xl font-bold text-ink">হ্যাপি কাস্টমার</h1>
        <p className="mt-3 text-sm text-ink-soft">
          ২,৩০০+ ক্রেতার ভালোবাসা ও আস্থার গল্প
        </p>
      </header>

      {reviews.length > 0 ? (
        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4">
          {reviews.map((r) => (
            <figure
              key={r.id}
              className="break-inside-avoid rounded-3xl border border-hairline bg-surface p-6 shadow-soft"
            >
              <div className="flex gap-0.5 text-accent" aria-label={`${r.rating} স্টার`}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="mt-3 leading-relaxed text-ink">“{r.quote}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blush font-bserif font-bold text-primary">
                  {r.customer_name.trim().charAt(0)}
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{r.customer_name}</span>
                  <span className="block text-xs text-ink-soft">ভেরিফায়েড ক্রেতা</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-2xl border border-dashed border-hairline bg-surface p-10 text-center text-sm leading-relaxed text-ink-soft">
          এখনো কোনো রিভিউ যোগ করা হয়নি।
          <br />
          আপনি অর্ডার করে প্রথম রিভিউটি লিখতে পারেন!
        </p>
      )}

      <p className="mt-8 text-center text-xs text-ink-soft">
        মোট {toBn(reviews.length)}টি রিভিউ · সব রিভিউ ক্রেতাদের নিজস্ব অভিজ্ঞতা
      </p>
    </div>
  );
}
