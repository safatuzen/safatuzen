import { createClient } from "@/lib/supabase/server";
import { NewReviewButton, ReviewCard } from "@/components/admin/review-editor";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-bserif text-2xl font-bold text-ink">রিভিউ</h1>
        <NewReviewButton />
      </header>
      <p className="mb-5 mt-1 text-sm text-ink-soft">হ্যাপি কাস্টমার পেজে যেগুলো “প্রকাশিত” — শুধু সেগুলোই ওয়েবসাইটে দেখা যাবে।</p>

      {(reviews ?? []).length === 0 ? (
        <p className="rounded-3xl border border-dashed border-hairline bg-surface p-10 text-center text-sm text-ink-soft">
          এখনো কোনো রিভিউ নেই। “+ নতুন রিভিউ” দিয়ে যোগ করুন।
        </p>
      ) : (
        <ul className="space-y-3">
          {(reviews ?? []).map((r) => (
            <ReviewCard
              key={r.id}
              initial={{
                id: r.id,
                customer_name: r.customer_name,
                quote: r.quote,
                rating: r.rating,
                photo_url: r.photo_url,
                is_published: Boolean(r.is_published),
              }}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
