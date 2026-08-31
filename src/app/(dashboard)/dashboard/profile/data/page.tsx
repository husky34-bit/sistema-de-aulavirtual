import { requireAuth } from "@/lib/auth-helpers";
import { exportUserData } from "@/features/admin/actions/export-user-data";
import { ExportDataButton } from "@/features/admin/components/export-data-button";

export default async function ProfileDataPage() {
  const user = await requireAuth();
  const data = await exportUserData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis datos personales</h1>
        <p className="text-sm text-slate-500">
          Descarga todos los datos asociados a tu cuenta en formato JSON.
        </p>
      </div>
      <ExportDataButton data={data} userName={user.name ?? user.id} />
    </div>
  );
}
