import Link from "next/link";
import { getActiveProducts, getProductBySlug, getSettings } from "@/lib/data";
import { CheckoutForm } from "./checkout-form";

export const metadata = {
  title: "অর্ডার করুন",
  description: "ক্যাশ অন ডেলিভারিতে অর্ডার করুন — পণ্য হাতে পেয়ে টাকা দিন।",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await searchParams;
  const settings = await getSettings();

  const product =
    typeof slug === "string" && slug ? await getProductBySlug(slug) : null;

  if (!product) {
    // No product preselected — let the customer pick one (fewer dead ends).
    const products = await getActiveProducts();
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="font-bserif text-3xl font-bold text-ink">প্রোডাক্ট বেছে নিন</h1>
        <p className="mt-2 text-sm text-ink-soft">অর্ডার ফর্মে যেতে আগে একটি প্রোডাক্ট সিলেক্ট করুন।</p>
        {products.length > 0 ? (
          <ul className="mt-6 space-y-3">
            {products.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/checkout?slug=${p.slug}`}
                  className="flex min-h-[64px] items-center justify-between rounded-2xl border border-hairline bg-surface p-4 shadow-soft hover:shadow-lift"
                >
                  <span className="font-medium text-ink">{p.name}</span>
                  <span className="font-poppins font-semibold text-primary">
                    ৳{Math.round(p.price).toLocaleString("en-IN")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 rounded-2xl border border-dashed border-hairline bg-surface p-8 text-center text-sm text-ink-soft">
            এখনো কোনো প্রোডাক্ট যোগ করা হয়নি। শীঘ্রই আসছে!
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-12">
      <h1 className="font-bserif text-3xl font-bold text-ink sm:text-4xl">অর্ডার করুন</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        নিচের ফর্মটি পূরণ করুন — আমরা ফোনে কনফার্ম করে ডেলিভারি পাঠাব।{" "}
        <strong className="text-primary-deep">ক্যাশ অন ডেলিভারি</strong> — পণ্য হাতে
        পেয়ে টাকা দিন।
      </p>

      <CheckoutForm
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          stock: product.stock,
        }}
        delivery={{ dhaka: settings.delivery_dhaka, outside: settings.delivery_outside }}
      />
    </div>
  );
}
