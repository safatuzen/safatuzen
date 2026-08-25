import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingCart, Star, Settings as SettingsIcon, LayoutDashboard, LogOut } from "lucide-react";
import { createClient, hasSupabaseEnv } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/admin/products", label: "প্রোডাক্ট", icon: Package },
  { href: "/admin/orders", label: "অর্ডার", icon: ShoppingCart },
  { href: "/admin/reviews", label: "রিভিউ", icon: Star },
  { href: "/admin/settings", label: "সেটিংস", icon: SettingsIcon },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg p-6">
        <div className="max-w-md rounded-3xl border border-hairline bg-surface p-8 text-center shadow-soft">
          <h1 className="font-bserif text-xl font-bold text-ink">সেটআপ প্রয়োজন</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            Supabase environment variables are missing. Add{" "}
            <code className="rounded bg-blush px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
            <code className="rounded bg-blush px-1.5 py-0.5 text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            and <code className="rounded bg-blush px-1.5 py-0.5 text-xs">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
            to your <code className="rounded bg-blush px-1.5 py-0.5 text-xs">.env.local</code>, then restart the app.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-bg pb-20 md:pb-0">
      <div className="mx-auto flex max-w-6xl md:gap-6 md:px-4 md:py-6">
        {/* Desktop sidebar */}
        <aside className="sticky top-6 hidden h-fit w-56 shrink-0 rounded-3xl border border-hairline bg-surface p-4 shadow-soft md:block">
          <Link href="/admin" className="flex items-center gap-2 px-2 py-1">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-bserif text-base font-bold text-white">স</span>
            <span className="font-bserif font-bold text-ink">SafaTu Zen Admin</span>
          </Link>
          <nav className="mt-4 space-y-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-[44px] items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink transition-colors hover:bg-blush hover:text-primary-deep"
              >
                <item.icon size={18} className="text-ink-soft" />
                {item.label}
              </Link>
            ))}
          </nav>
          <form action="/api/admin/logout" method="POST" className="mt-4 border-t border-hairline pt-3">
            <button
              type="submit"
              className="flex min-h-[44px] w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-danger hover:bg-danger/10"
            >
              <LogOut size={18} /> Logout
            </button>
          </form>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 md:px-0">{children}</main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-surface/95 backdrop-blur md:hidden">
        <div className="grid grid-cols-5">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-ink-soft"
            >
              <item.icon size={22} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
