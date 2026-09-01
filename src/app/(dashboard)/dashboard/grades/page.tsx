import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { UserReport } from "@/features/grades/components/user-report";
import { TeacherGradeCenter } from "@/features/grades/components/teacher-grade-center";

export default async function MyGradesPage() {
  const user = await requireAuth();

  const isTeacherOrAdmin =
    user.role === "TEACHER" ||
    user.role === "MANAGER" ||
    user.role === "ADMIN" ||
    user.role === "NON_EDITING_TEACHER";

  const studentEnrollmentsCount = await prisma.enrollment.count({
    where: { userId: user.id },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isTeacherOrAdmin ? "Centro de Calificaciones" : "Mis Calificaciones"}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {isTeacherOrAdmin
            ? "Supervisa y administra el libro de calificaciones de tus cursos y las notas de tus alumnos."
            : "Boleta consolidada de tus calificaciones en todos los cursos."}
        </p>
      </div>

      {isTeacherOrAdmin ? (
        <TeacherGradeCenter hasEnrollments={studentEnrollmentsCount > 0} />
      ) : (
        <UserReport />
      )}
    </div>
  );
}
