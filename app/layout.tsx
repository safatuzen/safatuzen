import type { Metadata, Viewport } from "next";
import { Noto_Serif_Bengali, Hind_Siliguri, Poppins } from "next/font/google";
import "./globals.css";

const notoSerifBengali = Noto_Serif_Bengali({
  variable: "--font-noto-serif-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
});

const hindSiliguri = Hind_Siliguri({
  variable: "--font-hind-siliguri",
  subsets: ["bengali", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "SafaTu Zen — আপনার দৈনন্দিন প্রয়োজনের আস্থাশীল ঠিকানা",
    template: "%s · SafaTu Zen",
  },
  description:
    "SafaTu Zen — বাংলাদেশের নারীদের জন্য গ্রুমিং, ওয়েলনেস ও ডেইলি নিডস প্রোডাক্ট। ক্যাশ অন ডেলিভারিতে সারা দেশে হোম ডেলিভারি।",
  openGraph: {
    siteName: "SafaTu Zen",
    type: "website",
    locale: "bn_BD",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFF9FB",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="bn"
      className={`${notoSerifBengali.variable} ${hindSiliguri.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
