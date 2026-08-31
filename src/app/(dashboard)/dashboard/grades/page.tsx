import { requireAuth } from "@/lib/auth-helpers";
import { UserReport } from "@/features/grades/components/user-report";

export default async function MyGradesPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mis Calificaciones</h1>
        <p className="text-sm text-slate-500">
          Boleta consolidada de tus calificaciones en todos los cursos.
        </p>
      </div>
      <UserReport />
    </div>
  );
}
