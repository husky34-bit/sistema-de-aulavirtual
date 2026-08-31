import { requireRole } from "@/lib/auth-helpers";
import { getAuditLogs } from "@/features/admin/actions/admin-actions";

export default async function AuditLogPage() {
  await requireRole(["ADMIN"]);
  const result = await getAuditLogs();
  const logs = result.success ? result.data : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Log de Auditoría</h1>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs text-slate-500">
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Usuario</th>
              <th className="px-3 py-2">Acción</th>
              <th className="px-3 py-2">Entidad</th>
              <th className="px-3 py-2">ID</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-slate-100">
                <td className="px-3 py-2 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                <td className="px-3 py-2 text-slate-700">{log.user?.name ?? log.user?.email ?? '—'}</td>
                <td className="px-3 py-2 font-medium text-slate-900">{log.action}</td>
                <td className="px-3 py-2 text-slate-600">{log.entity}</td>
                <td className="px-3 py-2 text-slate-400">{log.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
