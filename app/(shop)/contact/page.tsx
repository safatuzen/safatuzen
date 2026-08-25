import { Mail, MessageCircle } from "lucide-react";
import { FacebookIcon as Facebook, InstagramIcon as Instagram } from "@/components/brand-icons";
import { getSettings } from "@/lib/data";
import { formatBDT, waLink } from "@/lib/utils";

export const revalidate = 60;

export const metadata = {
  title: "যোগাযোগ",
  description: "SafaTu Zen-এর সাথে যোগাযোগ করুন — WhatsApp, Facebook, Instagram বা ইমেইলে।",
};

export default async function ContactPage() {
  const s = await getSettings();

  const cards = [
    {
      href: s.whatsapp_number
        ? waLink(s.whatsapp_number, "আসসালামু আলাইকুম! আমি অর্ডার সম্পর্কে জানতে চাই।")
        : undefined,
      icon: MessageCircle,
      title: "WhatsApp",
      desc: s.whatsapp_number ? `+${s.whatsapp_number.replace(/\D/g, "")}` : "শীঘ্রই যুক্ত হবে",
      cls: "bg-success text-white",
    },
    {
      href: s.messenger_url || undefined,
      icon: Facebook,
      title: "Facebook Messenger",
      desc: "facebook.com/safaTuZen",
      cls: "bg-primary text-white",
    },
    {
      href: s.instagram_url || undefined,
      icon: Instagram,
      title: "Instagram DM",
      desc: "@safatuzen",
      cls: "bg-ink text-white",
    },
    {
      href: s.email ? `mailto:${s.email}` : undefined,
      icon: Mail,
      title: "ইমেইল",
      desc: s.email,
      cls: "bg-blush text-primary-deep",
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <header className="text-center">
        <h1 className="font-bserif text-4xl font-bold text-ink">যোগাযোগ</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          অর্ডার নিয়ে সাহায্য লাগবে? যেকোনো মাধ্যমে নির্দ্বিধায় নক করুন 💗
        </p>
      </header>

      <div className="mt-9 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => {
          const Icon = c.icon;
          const inner = (
            <>
              <span className={`flex h-12 w-12 items-center justify-center rounded-full ${c.cls}`}>
                <Icon size={22} />
              </span>
              <span className="text-left">
                <span className="block font-semibold text-ink">{c.title}</span>
                <span className="block break-all text-sm text-ink-soft">{c.desc}</span>
              </span>
            </>
          );
          return c.href ? (
            <a
              key={c.title}
              href={c.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-[76px] items-center gap-4 rounded-3xl border border-hairline bg-surface p-5 shadow-soft transition-shadow hover:shadow-lift"
            >
              {inner}
            </a>
          ) : (
            <div key={c.title} className="flex min-h-[76px] cursor-not-allowed items-center gap-4 rounded-3xl border border-dashed border-hairline bg-surface p-5 opacity-70">
              {inner}
            </div>
          );
        })}
      </div>

      <section className="mt-10 rounded-3xl border border-hairline bg-blush/50 p-7">
        <h2 className="font-bserif text-xl font-bold text-ink">অর্ডার নিতে সাহায্য</h2>
        <ol className="mt-3 list-inside space-y-1.5 text-sm leading-relaxed text-ink/90">
          <li>১. শপ থেকে প্রোডাক্ট বেছে নিন</li>
          <li>২. “অর্ডার করুন” চেপে নাম-ঠিকানা দিন, অথবা WhatsApp-এ মেসেজ দিন</li>
          <li>৩. আমরা ফোনে কনফার্ম করে ডেলিভারি পাঠিয়ে দেব</li>
        </ol>
        <hr className="my-4 border-hairline" />
        <ul className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-ink-soft">
          <li>ঢাকার ভিতরে ডেলিভারি: <strong className="font-poppins text-primary">{formatBDT(s.delivery_dhaka)}</strong></li>
          <li>ঢাকার বাইরে: <strong className="font-poppins text-primary">{formatBDT(s.delivery_outside)}</strong></li>
          <li>ক্যাশ অন ডেলিভারি সব এলাকায়</li>
        </ul>
      </section>
    </div>
  );
}
