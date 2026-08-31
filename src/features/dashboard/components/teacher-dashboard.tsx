import Link from "next/link";
import {
  BarChartIcon,
  GraduationCapIcon,
  BookIcon,
  CheckCircleIcon,
} from "@/components/Icons";

interface TeacherDashboardProps {
  user: { name?: string | null; email?: string | null; role: string };
  coursesTaught: Array<{
    id: string;
    title: string;
    description: string | null;
    slug: string;
    _count: { enrollments: number; sections: number; quizzes: number; assignments: number };
  }>;
  pendingSubmissions: Array<{
    id: string;
    assignment: { id: string; title: string; course: { id: string; title: string } };
    user: { name: string | null; email: string };
    submittedAt: Date | null;
  }>;
}

export function TeacherDashboard({ user, coursesTaught, pendingSubmissions }: TeacherDashboardProps) {
  const totalStudents = coursesTaught.reduce((acc, c) => acc + c._count.enrollments, 0);
  const totalQuizzes = coursesTaught.reduce((acc, c) => acc + c._count.quizzes, 0);

  return (
    <div className="space-y-8 font-poppins">
      {/* Banner Superior Docente */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00155C] via-[#002147] to-[#0A1A3A] p-8 text-white shadow-xl shadow-[#00155C]/20 ring-1 ring-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#026BCA]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3.5 py-1 text-xs font-bold text-amber-300 ring-1 ring-amber-500/30 backdrop-blur-sm">
              <GraduationCapIcon size={14} className="shrink-0" /> ESPACIO DEL DOCENTE · COGNOS CAPACITACIÓN
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl font-poppins">
              ¡Bienvenido, Profesor {user.name ?? "Docente"}!
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              Gestiona los contenidos de tus módulos, califica entregas de laboratorio, programa clases en vivo y supervisa las evaluaciones de tus alumnos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/courses/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>+ Crear nuevo curso</span>
            </Link>
            <Link
              href="/dashboard/grades"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <span>Libro de Notas</span>
            </Link>
          </div>
        </div>

        {/* Métricas del Docente */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Cursos a tu Cargo</p>
            <p className="text-2xl font-extrabold text-[#00BCE4]">{coursesTaught.length}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Total Alumnos</p>
            <p className="text-2xl font-extrabold text-[#12AC81]">{totalStudents}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Por Calificar</p>
            <p className="text-2xl font-extrabold text-[#ECD06F]">{pendingSubmissions.length}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Evaluaciones Activas</p>
            <p className="text-2xl font-extrabold text-cyan-300">{totalQuizzes}</p>
          </div>
        </div>
      </div>

      {/* Bandeja de Tareas por Calificar */}
      {pendingSubmissions.length > 0 && (
        <section className="rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/10 p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-amber-200/60 dark:border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white font-bold text-xs">
                !
              </span>
              <div>
                <h3 className="text-base font-bold text-[#00155C]">Bandeja de Entregas por Calificar</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300">Alumnos que han enviado actividades esperando tu retroalimentación</p>
              </div>
            </div>
            <span className="rounded-full bg-amber-100 text-amber-900 dark:bg-amber-500/20 dark:text-amber-300 px-2.5 py-0.5 text-xs font-bold">
              {pendingSubmissions.length} pendiente(s)
            </span>
          </div>

          <div className="mt-4 divide-y divide-amber-200/50 dark:divide-amber-500/20">
            {pendingSubmissions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-2">
                <div>
                  <p className="text-sm font-bold text-[#00155C]">{sub.assignment.title}</p>
                  <p className="text-xs text-slate-600">
                    Estudiante: <strong>{sub.user.name ?? sub.user.email}</strong> • Curso: {sub.assignment.course.title}
                  </p>
                </div>
                <Link
                  href={`/dashboard/courses/${sub.assignment.course.id}/assign/${sub.assignment.id}`}
                  className="rounded-lg bg-[#00155C] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#026BCA] transition self-start sm:self-auto"
                >
                  Evaluar Entrega →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mis Cursos a Cargo */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#00155C]">Cursos que Impartes</h2>
            <p className="text-xs text-slate-500">Acceso a edición de contenidos, banco de preguntas y reportes</p>
          </div>
          <Link
            href="/dashboard/courses/new"
            className="text-xs font-bold text-[#026BCA] hover:underline"
          >
            + Crear nuevo curso
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {coursesTaught.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-[#026BCA] hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-[#EDF6FF] px-2.5 py-0.5 text-xs font-bold text-[#00155C]">
                    {course._count.enrollments} alumnos inscritos
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {course._count.sections} secciones
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-[#00155C]">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600 leading-relaxed font-normal">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <Link
                    href={`/dashboard/courses/${course.id}/questions`}
                    className="rounded-lg bg-slate-50 p-2 font-bold text-slate-700 hover:bg-[#EDF6FF] hover:text-[#00155C] transition flex flex-col items-center gap-1"
                  >
                    <BookIcon size={14} className="text-[#026BCA]" />
                    <span className="text-[10px]">Preguntas</span>
                  </Link>
                  <Link
                    href={`/dashboard/courses/${course.id}/grades`}
                    className="rounded-lg bg-slate-50 p-2 font-bold text-slate-700 hover:bg-[#EDF6FF] hover:text-[#00155C] transition flex flex-col items-center gap-1"
                  >
                    <BarChartIcon size={14} className="text-[#12AC81]" />
                    <span className="text-[10px]">Notas</span>
                  </Link>
                  <Link
                    href={`/dashboard/courses/${course.id}/reports`}
                    className="rounded-lg bg-slate-50 p-2 font-bold text-slate-700 hover:bg-[#EDF6FF] hover:text-[#00155C] transition flex flex-col items-center gap-1"
                  >
                    <CheckCircleIcon size={14} className="text-[#ECD06F]" />
                    <span className="text-[10px]">Reportes</span>
                  </Link>
                </div>

                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="block w-full rounded-xl bg-[#00155C] py-2 text-center text-xs font-bold text-white shadow-md hover:bg-[#026BCA] transition"
                >
                  Gestionar Contenidos →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
