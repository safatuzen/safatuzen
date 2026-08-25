export const metadata = {
  title: "আমাদের গল্প",
  description: "SafaTu Zen — একটি ছোট্ট বিশ্বাসের শুরুর গল্প। #NewJourney #SmallBusiness",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <header className="text-center">
        <h1 className="font-bserif text-4xl font-bold text-ink">
          আমাদের <span className="text-primary">গল্প</span>
        </h1>
        <p className="mt-2 font-poppins text-xs uppercase tracking-[0.25em] text-ink-soft">
          #NewJourney #SmallBusiness
        </p>
      </header>

      <div className="mt-10 grid items-center gap-8 md:grid-cols-[1fr_320px]">
        <div className="space-y-5 leading-relaxed text-ink/90">
          <p>
            SafaTu Zen-এর যাত্রা শুরু একটি ছোট্ট স্বপ্ন থেকে —{" "}
            <strong>নিজের ঘরে বসে নিজের ভাষায়, মানের পণ্য পৌঁছে দেওয়া</strong> প্রতিটি
            নারীর কাছে। Alhamdulillah, আজ ২,৩০০+ ক্রেতার ভালোবাসা আর আস্থাই আমাদের
            সবচেয়ে বড় অর্জন।
          </p>
          <p>
            আমরা বিশ্বাস করি — <em>confidence through modesty, beauty through simplicity.</em>{" "}
            তাই আমাদের প্রতিটি প্রোডাক্ট বাছাই করা হয় সতর্কভাবে; গ্রুমিং থেকে ওয়েলনেস,
            কিচেন থেকে ডেইলি নিডস — এমন সব জিনিস, যা আপনার দৈনন্দিন জীবনকে একটু সহজ,
            একটু সুন্দর করে।
          </p>
          <p>
            ক্যাশ অন ডেলিভারিতে সারা বাংলাদেশে পণ্য পৌঁছে দেওয়াই আমাদের প্রতিশ্রুতি —
            MashaAllah, একদিন এই ছোট্ট প্রতিষ্ঠানটি হয়ে উঠুক আপনার ঘরে ঘরে বিশ্বস্ত নাম।
          </p>
          <p className="font-bserif text-xl font-semibold text-primary-deep">
            “আপনার দৈনন্দিন প্রয়োজনের আস্থাশীল ঠিকানা।”
          </p>
        </div>

        {/* Brand photo slot — the owner uploads her photo here via admin/brand assets */}
        <figure className="mx-auto w-full max-w-[280px]">
          <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-blush to-[#f6d3e2] shadow-lift">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-surface font-bserif text-4xl font-bold text-primary shadow-soft">
              স
            </span>
            <figcaption className="px-6 pb-2 text-center text-xs leading-relaxed text-ink-soft">
              SafaTu Zen
              <br />
              ফটোগ্রাফি স্লট — ব্র্যান্ড ছবি এখানে
            </figcaption>
          </div>
        </figure>
      </div>

      <dl className="mt-12 grid grid-cols-3 gap-4 text-center">
        {[
          ["২,৩০০+", "হ্যাপি কাস্টমার"],
          ["৬", "কিউরেটেড প্রোডাক্ট"],
          ["৬৪", "জেলায় ডেলিভারি"],
        ].map(([n, l]) => (
          <div key={l} className="rounded-3xl border border-hairline bg-surface p-6 shadow-soft">
            <dt className="font-poppins text-2xl font-bold text-primary">{n}</dt>
            <dd className="mt-1 text-xs text-ink-soft">{l}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
