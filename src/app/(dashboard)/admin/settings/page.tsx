import { requireRole } from "@/lib/auth-helpers";
import { getSiteSettings } from "@/features/admin/actions/admin-actions";
import { SettingsManager } from "@/features/admin/components/settings-manager";

export default async function AdminSettingsPage() {
  await requireRole(["ADMIN"]);
  const result = await getSiteSettings();
  const settings = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Configuración del sitio</h1>
      <SettingsManager settings={settings.map((s) => ({ key: s.key, value: s.value }))} />
    </div>
  );
}
