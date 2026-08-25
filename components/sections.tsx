import Link from "next/link";
import { ShieldCheck, Truck, BadgeCheck } from "lucide-react";
import type { ProductWithImages } from "@/lib/types";
import { getSettings } from "@/lib/data";
import { formatBDT } from "@/lib/utils";
import { PriceBlock } from "@/components/price-block";

export async function Hero({ heroProduct }: { heroProduct: ProductWithImages | null }) {
  const s = await getSettings();

  return (
    <section className="hero-glow relative overflow-hidden">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-12 pt-10 sm:pt-14 lg:grid-cols-2 lg:pb-20 lg:pt-20">
        <div>
          <h1 className="font-bserif text-4xl font-bold leading-snug text-ink sm:text-5xl sm:leading-snug">
            আপনার দৈনন্দিন{" "}
            <span className="text-primary">প্রয়োজনের</span> আস্থাশীল{" "}
            <span className="relative inline-block">
              ঠিকানা।
              <span className="absolute inset-x-0 -bottom-1 h-2 rounded-full bg-accent/30" />
            </span>
          </h1>
          <p className="mt-4 max-w-md font-poppins text-sm tracking-wide text-ink-soft sm:text-base">
            Everyday essentials, delivered to your door — Cash on Delivery all over Bangladesh.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="#featured"
              className="inline-flex min-h-[48px] items-center rounded-full bg-primary px-7 text-base font-semibold text-white shadow-soft transition-colors hover:bg-primary-deep"
            >
              এখনই কিনুন
            </a>
            <Link
              href="/shop"
              className="inline-flex min-h-[48px] items-center rounded-full border border-primary/40 bg-surface px-7 text-base font-semibold text-primary transition-colors hover:bg-blush"
            >
              প্রোডাক্ট দেখুন
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft">
            {["ক্যাশ অন ডেলিভারি", "সারা বাংলাদেশে ডেলিভারি", "২,৩০০+ হ্যাপি কাস্টমার"].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <BadgeCheck size={16} className="shrink-0 text-accent" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <div className="rounded-3xl bg-gradient-to-br from-blush to-[#f6d3e2] p-4 shadow-lift sm:p-6">
            {heroProduct ? (
              <>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-white">
                  {heroProduct.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={heroProduct.images[0].url}
                      alt={heroProduct.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="absolute inset-0 flex items-center justify-center font-bserif text-8xl font-bold text-primary/40">
                      {heroProduct.name.trim().charAt(0)}
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-end justify-between px-1 pb-1">
                  <div>
                    <p className="line-clamp-1 font-semibold text-ink">{heroProduct.name}</p>
                    <PriceBlock
                      price={heroProduct.price}
                      compareAtPrice={heroProduct.compare_at_price}
                    />
                  </div>
                  <Link
                    href={`/product/${heroProduct.slug}`}
                    className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-deep"
                  >
                    দেখুন
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex aspect-square flex-col items-center justify-center gap-3 text-center">
                <span className="font-bserif text-7xl font-bold text-primary/50">স</span>
                <p className="max-w-[16rem] text-sm text-ink-soft">
                  শীঘ্রই এখানে দেখা যাবে আপনার প্রিয় প্রোডাক্ট
                </p>
              </div>
            )}
          </div>
          <p className="mt-3 text-center text-xs text-ink-soft">
            ঢাকার ভিতরে {formatBDT(s.delivery_dhaka)} · ঢাকার বাইরে {formatBDT(s.delivery_outside)} ডেলিভারি
          </p>
        </div>
      </div>
    </section>
  );
}

export function ValueProps() {
  const items = [
    {
      icon: Truck,
      title: "ক্যাশ অন ডেলিভারি",
      desc: "পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন — সারা বাংলাদেশে।",
    },
    {
      icon: ShieldCheck,
      title: "৬ মাসের ওয়ারেন্টি",
      desc: "নির্বাচিত প্রোডাক্টে ছয় মাসের ওয়ারেন্টি সহায়তা।",
    },
    {
      icon: BadgeCheck,
      title: "ভেরিফায়েড সেলার",
      desc: "২,৩০০+ ক্রেতার আস্থার নাম — SafaTu Zen।",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="text-center font-bserif text-3xl font-bold text-ink">
        কেন <span className="text-primary">SafaTu Zen?</span>
      </h2>
      <div className="mt-9 grid gap-5 sm:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.title}
            className="rounded-3xl border border-hairline bg-surface p-7 text-center shadow-soft"
          >
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blush text-primary">
              <item.icon size={26} />
            </span>
            <h3 className="mt-4 font-bserif text-xl font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function HowToOrder() {
  const steps = [
    {
      n: "১",
      title: "প্রোডাক্ট বেছে নিন",
      desc: "শপ থেকে আপনার পছন্দের প্রোডাক্টটি খুঁজে নিন।",
    },
    {
      n: "২",
      title: "নাম-ঠিকানা দিন / WhatsApp-এ মেসেজ করুন",
      desc: "অর্ডার ফর্ম পূরণ করুন, অথবা সরাসরি WhatsApp-এ লিখুন।",
    },
    {
      n: "৩",
      title: "ক্যাশ অন ডেলিভারিতে পেয়ে যান",
      desc: "পণ্য হাতে পেয়ে চেক করে টাকা পরিশোধ করুন।",
    },
  ];

  return (
    <section className="bg-blush/60 py-14">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-bserif text-3xl font-bold text-ink">
          কীভাবে অর্ডার করবেন?
        </h2>
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.n} className="relative rounded-3xl bg-surface p-7 shadow-soft">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary font-bserif text-lg font-bold text-white">
                {step.n}
              </span>
              <h3 className="mt-4 font-semibold leading-relaxed text-ink">{step.title}</h3>
              <p className="mt-1.5 text-sm text-ink-soft">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
