"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/", label: "হোম" },
  { href: "/shop", label: "শপ" },
  { href: "/reviews", label: "রিভিউ" },
  { href: "/contact", label: "যোগাযোগ" },
];

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`} aria-label="SafaTu Zen — হোম">
      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface p-0.5 shadow-xs ring-1 ring-black/5">
        <Image
          src="/logo-icon.png"
          alt="SafaTu Zen Emblem Logo"
          width={40}
          height={40}
          className="h-full w-full object-contain"
          priority
        />
      </div>
      <span className="font-bserif text-xl font-bold tracking-tight text-ink">
        SafaTu <span className="text-primary">Zen</span>
      </span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/shop"
            className="hidden rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-soft transition-colors hover:bg-primary-deep md:inline-flex"
          >
            অর্ডার করুন
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "মেনু বন্ধ করুন" : "মেনু খুলুন"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-ink md:hidden"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-hairline bg-surface md:hidden"
          >
            <div className="flex flex-col px-6 py-3">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-[48px] items-center border-b border-blush last:border-0 text-base font-medium text-ink"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/shop"
                onClick={() => setOpen(false)}
                className="my-3 rounded-full bg-primary py-3 text-center font-semibold text-white"
              >
                অর্ডার করুন
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
