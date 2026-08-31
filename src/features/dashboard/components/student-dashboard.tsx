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
    <div className="space-y-8 font-poppins">
      {/* Banner Superior Estudiante */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00155C] via-[#002147] to-[#0A1A3A] p-8 text-white shadow-xl shadow-[#00155C]/20 ring-1 ring-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#026BCA]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#00BCE4]/15 px-3.5 py-1 text-xs font-bold text-[#00BCE4] ring-1 ring-[#00BCE4]/30 backdrop-blur-sm">
              <GraduationCapIcon size={14} className="shrink-0" /> AULA VIRTUAL · GRUPO COGNOS
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl font-poppins">
              ¡Hola, {user.name ?? "Estudiante"}!
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-xl font-normal leading-relaxed">
              «El placer de enseñar, la pasión por aprender». Accede a tus clases en vivo, interactúa en foros y avanza hacia tu certificación profesional.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/courses"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#026BCA] to-[#00BCE4] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#026BCA]/30 transition-all hover:scale-105 active:scale-95"
            >
              <span>Explorar Catálogo</span>
              <span>→</span>
            </Link>
            <Link
              href="/dashboard/grades"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <span>Mis Calificaciones</span>
            </Link>
          </div>
        </div>

        {/* Métricas del Estudiante */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Cursos Activos</p>
            <p className="text-2xl font-extrabold text-[#00BCE4]">{enrollments.length}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Estado de Avance</p>
            <p className="text-sm font-bold text-[#12AC81] flex items-center gap-1.5 mt-1">
              <CheckCircleIcon size={14} className="text-[#12AC81]" /> Al Día
            </p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Requisito Certificación</p>
            <p className="text-xs font-bold text-[#ECD06F] mt-1">≥ 70 pts & 80% Asistencia</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Acreditaciones</p>
            <p className="text-sm font-bold text-cyan-300 mt-1 flex items-center gap-1">
              <AwardIcon size={14} /> Cognos Internacional
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
