import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getSettings } from "@/lib/data";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();

  return (
    <>
      {s.announcement ? (
        <div className="bg-primary px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
          {s.announcement}
        </div>
      ) : null}
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
