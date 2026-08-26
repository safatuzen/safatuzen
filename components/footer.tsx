import Link from "next/link";
import Image from "next/image";
import { Mail, MessageCircle } from "lucide-react";
import { FacebookIcon as Facebook, InstagramIcon as Instagram } from "@/components/brand-icons";
import { getSettings } from "@/lib/data";
import { formatBDT, waLink } from "@/lib/utils";

export async function Footer() {
  const s = await getSettings();

  return (
    <footer className="mt-auto border-t border-hairline bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5">
            <Image
              src="/logo-icon.png"
              alt="SafaTu Zen"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="font-bserif text-xl font-bold text-ink">
              SafaTu <span className="text-primary">Zen</span>
            </span>
          </Link>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            আপনার দৈনন্দিন প্রয়োজনের আস্থাশীল ঠিকানা। বিশ্বাসের সাথে, মানের সাথে —
            প্রতিটি পণ্য পৌঁছে যাক আপনার ঘরে।
          </p>
        </div>

        <div>
          <p className="font-semibold text-ink">যোগাযোগ</p>
          <ul className="mt-3 space-y-2.5 text-sm text-ink-soft">
            {s.whatsapp_number ? (
              <li>
                <a
                  href={waLink(s.whatsapp_number, "আসসালামু আলাইকুম! আমি একটি অর্ডার সম্পর্কে জানতে চাই।")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary"
                >
                  <MessageCircle size={16} className="text-success" />
                  WhatsApp: +{s.whatsapp_number.replace(/\D/g, "")}
                </a>
              </li>
            ) : null}
            <li>
              <a href={`mailto:${s.email}`} className="inline-flex items-center gap-2 hover:text-primary">
                <Mail size={16} /> {s.email}
              </a>
            </li>
            <li>
              <a href={s.messenger_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                <Facebook size={16} /> facebook.com/safaTuZen
              </a>
            </li>
            <li>
              <a href={s.instagram_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-primary">
                <Instagram size={16} /> @safatuzen
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-ink">ডেলিভারি তথ্য</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li>ঢাকার ভিতরে: {formatBDT(s.delivery_dhaka)}</li>
            <li>ঢাকার বাইরে: {formatBDT(s.delivery_outside)}</li>
            <li>ক্যাশ অন ডেলিভারি — সারা দেশে</li>
            <li>১–৩ দিনের মধ্যে ডেলিভারি</li>
          </ul>
        </div>

        <div>
          <p className="font-semibold text-ink">প্রয়োজনীয় লিংক</p>
          <ul className="mt-3 space-y-2 text-sm text-ink-soft">
            <li><Link href="/shop" className="hover:text-primary">শপ</Link></li>
            <li><Link href="/about" className="hover:text-primary">আমাদের গল্প</Link></li>
            <li><Link href="/reviews" className="hover:text-primary">হ্যাপি কাস্টমার</Link></li>
            <li><Link href="/contact" className="hover:text-primary">যোগাযোগ</Link></li>
            <li><Link href="/admin" className="text-xs text-ink-soft/60 hover:text-primary">Admin</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-hairline py-4 text-center text-xs text-ink-soft">
        © {new Date().getFullYear()} SafaTu Zen · #NewJourney #SmallBusiness
      </div>
    </footer>
  );
}
