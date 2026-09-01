import Link from "next/link";
import {
  BookOpenIcon,
  GraduationCapIcon,
  CheckCircleIcon,
  ClockIcon,
  AwardIcon,
  BarChartIcon,
} from "@/components/Icons";
import { CognosMethodologyCard } from "./cognos-methodology-card";
import { CertificateModal } from "./certificate-modal";

interface StudentDashboardProps {
  user: { name?: string | null; email?: string | null; role: string };
  enrollments: Array<{
    id: string;
    course: {
      id: string;
      title: string;
      description: string | null;
      instructor: { name: string | null };
      _count: { sections: number; quizzes: number; assignments: number };
    };
  }>;
  upcomingTasks: Array<{
    id: string;
    title: string;
    dueAt: Date | null;
    courseId: string;
    courseTitle: string;
    type: "assign" | "quiz";
  }>;
}

export function StudentDashboard({ user, enrollments, upcomingTasks }: StudentDashboardProps) {
  return (
    <div className="space-y-6 font-poppins">
      {/* Encabezado Minimalista Sin Caja Contenedora */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00155C] dark:text-[#00BCE4]">
            <GraduationCapIcon size={12} className="shrink-0" />
            <span>Aula Virtual · Cognos Capacitación</span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#00155C] dark:text-white tracking-tight">
            ¡Hola, {user.name ?? "Estudiante"}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            «El placer de enseñar, la pasión por aprender». Accede a tus clases en vivo, interactúa en foros y avanza hacia tu certificación profesional.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 bg-[#00155C] px-4 py-2 text-xs font-bold text-white hover:bg-[#026BCA] transition dark:bg-[#026BCA] dark:hover:bg-[#00BCE4] dark:hover:text-[#00155C]"
          >
            <span>Explorar Catálogo →</span>
          </Link>
          <Link
            href="/dashboard/grades"
            className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101D31] px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <BarChartIcon size={14} />
            <span>Mis Calificaciones</span>
          </Link>
        </div>
      </div>

      {/* Fila de 4 Tarjetas KPI Independientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cursos Activos */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#026BCA] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cursos Activos
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#00155C] dark:text-[#00BCE4]">
              <BookOpenIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#00155C] dark:text-white">
              {enrollments.length}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Programas matriculados
            </p>
          </div>
        </div>

        {/* KPI 2: Estado de Avance */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#12AC81] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estado de Avance
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#12AC81]">
              <CheckCircleIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-2xl font-extrabold text-[#12AC81] flex items-center gap-1.5">
              Al Día
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Actividades al corriente
            </p>
          </div>
        </div>

        {/* KPI 3: Requisito de Certificación */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#ECD06F] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Certificación
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#ECD06F]">
              <ClockIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xl font-extrabold text-[#00155C] dark:text-white">
              ≥ 70 pts
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              y 80% asistencia mínima
            </p>
          </div>
        </div>

        {/* KPI 4: Acreditaciones */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#00BCE4] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Acreditación
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#00BCE4]">
              <AwardIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-base font-extrabold text-[#00155C] dark:text-white truncate">
              Cognos Internacional
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Certificación oficial
            </p>
          </div>
        </div>
      </div>

      {/* Metodología Cognos en 5 Pasos */}
      <CognosMethodologyCard />

      {/* Grid Principal: Mis Cursos y Próximas Actividades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mis Cursos Matriculados (2 Columnas) */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-[#00155C]">Mis Programas de Formación</h2>
              <p className="text-xs text-slate-500">Cursos en los que estás participando actualmente</p>
            </div>
            <Link
              href="/dashboard/courses"
              className="text-xs font-bold text-[#026BCA] hover:underline"
            >
              Ver catálogo completo →
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDF6FF] text-[#00155C]">
                <BookOpenIcon size={28} />
              </div>
              <h3 className="mt-4 text-base font-bold text-[#00155C]">No estás matriculado en ningún curso</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                Explora los cursos en vivo de Cognos Capacitación e inscríbete para acceder a tus clases.
              </p>
              <Link
                href="/dashboard/courses"
                className="mt-5 inline-flex items-center rounded-xl bg-[#00155C] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#026BCA] transition"
              >
                Explorar Cursos Disponibles
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {enrollments.map((e) => (
                <div
                  key={e.id}
                  className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#026BCA] hover:shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#EDF6FF] px-2.5 py-0.5 text-xs font-bold text-[#00155C]">
                        En Curso
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#026BCA]">
                        Virtual en Vivo
                      </span>
                    </div>

                    <h3 className="mt-3 text-base font-bold text-[#00155C] leading-snug">
                      {e.course.title}
                    </h3>
                    
                    <p className="mt-2 text-xs text-slate-500 font-normal">
                      Instructor: <strong className="text-slate-700">{e.course.instructor.name}</strong>
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>Progreso del Curso</span>
                        <span className="text-[#026BCA]">75%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#026BCA] to-[#00BCE4] w-3/4" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <CertificateModal
                        studentName={user.name ?? "Estudiante Zenvia"}
                        courseTitle={e.course.title}
                        gradeScore={92}
                      />
                      <Link
                        href={`/dashboard/courses/${e.course.id}/grades`}
                        className="text-xs font-bold text-slate-600 hover:text-[#00155C] flex items-center gap-1"
                      >
                        <BarChartIcon size={12} /> Notas
                      </Link>
                    </div>

                    <Link
                      href={`/dashboard/courses/${e.course.id}`}
                      className="block w-full rounded-xl bg-[#00155C] py-2 text-center text-xs font-bold text-white shadow-md hover:bg-[#026BCA] transition"
                    >
                      Entrar al Aula Virtual →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Barra Lateral: Próximas Entregas & Evaluaciones (1 Columna) */}
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#00155C]">Próximas Actividades</h2>
            <p className="text-xs text-slate-500">Tareas y evaluaciones con fecha límite</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            {upcomingTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckCircleIcon size={28} className="mx-auto text-emerald-500 mb-2" />
                No tienes actividades pendientes para esta semana.
              </div>
            ) : (
              upcomingTasks.map((t) => (
                <Link
                  key={t.id}
                  href={`/dashboard/courses/${t.courseId}/${t.type === "assign" ? "assign" : "quiz"}/${t.id}`}
                  className="block rounded-xl border border-slate-100 bg-slate-50 p-3.5 hover:bg-[#EDF6FF] hover:border-[#026BCA] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-extrabold uppercase ${
                      t.type === "assign"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300"
                        : "bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300"
                    }`}>
                      {t.type === "assign" ? "Tarea" : "Cuestionario"}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <ClockIcon size={10} />
                      {t.dueAt ? new Date(t.dueAt).toLocaleDateString() : "Próximamente"}
                    </span>
                  </div>
                  <h4 className="mt-1.5 text-xs font-bold text-[#00155C] line-clamp-1">{t.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{t.courseTitle}</p>
                </Link>
              ))
            )}

            <Link
              href="/dashboard/calendar"
              className="block text-center pt-2 text-xs font-bold text-[#026BCA] hover:underline"
            >
              Ver Calendario Completo →
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
