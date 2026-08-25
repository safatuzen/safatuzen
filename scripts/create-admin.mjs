/**
 * Creates (or resets the password of) the admin user in Supabase Auth.
 *
 * Usage:
 *   1. Fill NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env.local
 *   2. node scripts/create-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

// Tiny .env parser (no dotenv dependency needed).
const env = {};
try {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8").replace(/^\uFEFF/, "");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith("#")) env[m[1]] = m[2];
  }
} catch {}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
const EMAIL = env.ADMIN_EMAIL ?? process.env.ADMIN_EMAIL;
const PASSWORD = env.ADMIN_PASSWORD ?? process.env.ADMIN_PASSWORD;

if (!SUPABASE_URL || !SERVICE_KEY || !EMAIL || !PASSWORD) {
  console.error("Missing env vars. Fill .env.local first (see scripts/create-admin.mjs header).");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

const { data: list } = await supabase.auth.admin.listUsers({ page: 1, perPage: 100 });
const existing = list?.users?.find((u) => u.email?.toLowerCase() === EMAIL.toLowerCase());

if (existing) {
  const { error } = await supabase.auth.admin.updateUserById(existing.id, { password: PASSWORD });
  if (error) throw error;
  console.log("✅ Admin password updated for", EMAIL);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (error) throw error;
  console.log("✅ Admin user created:", data.user.email);
}
