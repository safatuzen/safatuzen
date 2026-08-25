import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/data";
import { waLink } from "@/lib/utils";

export const metadata = {
  title: "অর্ডার কনফার্ম হয়েছে",
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { no } = await searchParams;
  const s = await getSettings();
  const orderNo = typeof no === "string" && no.startsWith("SZ-") ? no : null;

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-14 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-blush">
        <CheckCircle2 size={44} className="text-success" />
      </span>

      <h1 className="mt-6 font-bserif text-3xl font-bold text-ink sm:text-4xl">
        ধন্যবাদ! অর্ডারটি পৌঁছেছে ✅
      </h1>
      <p className="mt-3 leading-relaxed text-ink/90">
        Alhamdulillah — আপনার অর্ডারটি আমরা পেয়েছি। শীঘ্রই আমাদের একজন প্রতিনিধি{" "}
        <strong>ফোনে কনফার্ম</strong> করবেন, তারপরই ডেলিভারি শুরু হবে (ঢাকায় ১–২ দিন,
        ঢাকার বাইরে ২–৩ দিন)।
      </p>

      {orderNo ? (
        <div className="mt-6 rounded-3xl border border-hairline bg-surface px-8 py-5 shadow-soft">
          <p className="text-xs uppercase tracking-widest text-ink-soft">আপনার অর্ডার নম্বর</p>
          <p className="mt-1 font-poppins text-2xl font-bold text-primary">{orderNo}</p>
        </div>
      ) : null}

      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        {s.whatsapp_number && orderNo ? (
          <a
            href={waLink(
              s.whatsapp_number,
              `আসসালামু আলাইকুম! আমি ওয়েবসাইটে অর্ডার করেছি। অর্ডার নম্বর: ${orderNo} — অনুগ্রহ করে কনফার্ম করুন।`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-success px-6 font-semibold text-white transition-opacity hover:opacity-90"
          >
            <MessageCircle size={20} />
            অর্ডারটি WhatsApp-এ কনফার্ম করুন
          </a>
        ) : null}
        <Link
          href="/shop"
          className="inline-flex h-[52px] flex-1 items-center justify-center rounded-full border border-primary/40 bg-surface px-6 font-semibold text-primary hover:bg-blush"
        >
          আরও কিছু দেখুন
        </Link>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-soft">
        যেকোনো প্রয়োজনে WhatsApp-এ লিখুন বা <Link href="/contact" className="text-primary">যোগাযোগ পেজে</Link> যান।
        ক্যাশ অন ডেলিভারি — অগ্রিম কোনো টাকা লাগবে না।
      </p>
    </div>
  );
}
