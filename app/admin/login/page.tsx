"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setError("Wrong email or password. / ইমেইল বা পাসওয়ার্ড ভুল হয়েছে।");
        setBusy(false);
        return;
      }
      router.replace(next.startsWith("/admin") ? next : "/admin");
      router.refresh();
    } catch {
      setError("Something went wrong. Check your internet connection.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">Email</label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 w-full rounded-2xl border border-hairline bg-surface px-4 outline-none focus:border-primary"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">Password</label>
        <input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-12 w-full rounded-2xl border border-hairline bg-surface px-4 outline-none focus:border-primary"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-danger/10 p-3 text-sm text-danger">{error}</p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="h-12 w-full rounded-full bg-primary font-semibold text-white shadow-soft transition-colors hover:bg-primary-deep disabled:opacity-60"
      >
        {busy ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm rounded-3xl border border-hairline bg-surface p-8 shadow-lift">
        <Link href="/" className="flex items-center justify-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bserif text-lg font-bold text-white">স</span>
          <span className="font-bserif text-xl font-bold text-ink">
            SafaTu <span className="text-primary">Zen</span>
          </span>
        </Link>

        <h1 className="mt-6 text-center font-semibold text-ink">Admin Login</h1>
        <p className="mt-1 text-center text-sm text-ink-soft">অ্যাডমিন প্যানেলে প্রবেশ করুন</p>

        <Suspense fallback={<div className="mt-6 text-center text-sm text-ink-soft">Loading...</div>}>
          <LoginForm />
        </Suspense>

        <p className="mt-4 text-center text-xs leading-relaxed text-ink-soft">
          Credentials are defined in <code className="rounded bg-blush px-1 py-0.5">.env.local</code>.
          Run <code className="rounded bg-blush px-1 py-0.5">node scripts/create-admin.mjs</code> to sync admin credentials.
        </p>
      </div>
    </div>
  );
}
