import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SETTINGS } from "@/lib/types";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [{ data: settings }, { data: products }] = await Promise.all([
    supabase.from("store_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.from("products").select("id, name").eq("is_active", true).order("name"),
  ]);

  return (
    <div>
      <h1 className="font-bserif text-2xl font-bold text-ink">সেটিংস</h1>
      <p className="mb-6 mt-1 text-sm text-ink-soft">এখানে যা বদলাবেন, তা সাথে সাথেই ওয়েবসাইটে দেখা যাবে।</p>
      <SettingsForm
        initial={{ ...DEFAULT_SETTINGS, ...(settings ?? {}) }}
        products={(products ?? []).map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
