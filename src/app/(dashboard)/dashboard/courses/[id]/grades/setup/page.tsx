import { requireRole } from "@/lib/auth-helpers";
import { GradeCategoriesEditor } from "@/features/grades/components/grade-categories-editor";

export default async function GradesSetupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["ADMIN", "TEACHER", "MANAGER"]);
  const { id: courseId } = await params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Configuración del Gradebook</h1>
        <p className="text-sm text-slate-500">
          Categorías, ponderaciones e ítems manuales.
        </p>
      </div>
      <GradeCategoriesEditor courseId={courseId} />
    </div>
  );
}
