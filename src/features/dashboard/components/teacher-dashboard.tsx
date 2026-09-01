import Link from "next/link";
import {
  BarChartIcon,
  GraduationCapIcon,
  BookIcon,
  BookOpenIcon,
  UsersIcon,
  CheckCircleIcon,
  ClockIcon,
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

  // Evitar duplicar "Profesor Profesor" si el nombre ya incluye el título
  const rawName = user.name?.trim() ?? "Docente";
  const displayName = rawName.toLowerCase().startsWith("profesor")
    ? rawName
    : `Profesor ${rawName}`;

  return (
    <div className="space-y-6 font-poppins">
      {/* Encabezado Minimalista Sin Caja Contenedora */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#00155C] dark:text-[#00BCE4]">
            <GraduationCapIcon size={12} className="shrink-0" />
            <span>Espacio del Docente · Cognos Capacitación</span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#00155C] dark:text-white tracking-tight">
            ¡Bienvenido, {displayName}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Gestiona los contenidos de tus módulos, califica entregas de laboratorio y supervisa el progreso de tus alumnos.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/courses/new"
            className="inline-flex items-center gap-2 bg-[#00155C] px-4 py-2 text-xs font-bold text-white hover:bg-[#026BCA] transition dark:bg-[#026BCA] dark:hover:bg-[#00BCE4] dark:hover:text-[#00155C]"
          >
            <span>+ Crear Nuevo Curso</span>
          </Link>
          <Link
            href="/dashboard/grades"
            className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101D31] px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <BarChartIcon size={14} />
            <span>Libro de Notas</span>
          </Link>
        </div>
      </div>

      {/* Fila de 4 Tarjetas KPI Independientes (Minimalistas y Cuadradas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Cursos a Cargo */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#026BCA] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cursos a tu Cargo
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#00155C] dark:text-[#00BCE4]">
              <BookOpenIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#00155C] dark:text-white">
              {coursesTaught.length}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Programas asignados activos
            </p>
          </div>
        </div>

        {/* KPI 2: Total Alumnos */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#12AC81] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Alumnos
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#12AC81]">
              <UsersIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#12AC81]">
              {totalStudents}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Estudiantes matriculados
            </p>
          </div>
        </div>

        {/* KPI 3: Por Calificar */}
        <div className={`border bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between transition ${
          pendingSubmissions.length > 0
            ? 'border-amber-400/80 bg-amber-50/20 dark:bg-amber-950/10'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Por Calificar
            </span>
            <span className={`flex h-8 w-8 items-center justify-center border ${
              pendingSubmissions.length > 0
                ? 'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-400'
            }`}>
              <ClockIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-extrabold ${
                pendingSubmissions.length > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'
              }`}>
                {pendingSubmissions.length}
              </p>
              {pendingSubmissions.length === 0 && (
                <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-1.5 py-0.2 border border-emerald-200 dark:border-emerald-800">
                  Al día
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {pendingSubmissions.length > 0 ? 'Entregas esperando revisión' : 'Sin tareas pendientes'}
            </p>
          </div>
        </div>

        {/* KPI 4: Evaluaciones Activas */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#00BCE4] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Evaluaciones Activas
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#00BCE4]">
              <BarChartIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#00155C] dark:text-white">
              {totalQuizzes}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Cuestionarios en curso
            </p>
          </div>
        </div>
      </div>

      {/* Bandeja de Tareas por Calificar */}
      {pendingSubmissions.length > 0 && (
        <section className="border border-amber-300 dark:border-amber-600/40 bg-amber-50/40 dark:bg-amber-950/10 p-5">
          <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-700/40 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center bg-amber-500 text-white font-bold text-xs">
                !
              </span>
              <div>
                <h3 className="text-sm font-bold text-[#00155C] dark:text-amber-200">
                  Bandeja de Entregas por Calificar
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Alumnos que han enviado actividades esperando tu retroalimentación
                </p>
              </div>
            </div>
            <span className="border border-amber-300 bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase">
              {pendingSubmissions.length} pendiente(s)
            </span>
          </div>

          <div className="mt-3 divide-y divide-amber-200/60 dark:divide-amber-700/30">
            {pendingSubmissions.slice(0, 5).map((sub) => (
              <div key={sub.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 gap-2">
                <div>
                  <p className="text-xs font-bold text-[#00155C] dark:text-white">{sub.assignment.title}</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Estudiante: <strong>{sub.user.name ?? sub.user.email}</strong> • Curso: {sub.assignment.course.title}
                  </p>
                </div>
                <Link
                  href={`/dashboard/courses/${sub.assignment.course.id}/assign/${sub.assignment.id}`}
                  className="bg-[#00155C] px-3 py-1 text-xs font-bold text-white hover:bg-[#026BCA] transition self-start sm:self-auto"
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
            <h2 className="text-base sm:text-lg font-bold text-[#00155C] dark:text-white">
              Cursos que Impartes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acceso a edición de contenidos, banco de preguntas y libro de calificaciones
            </p>
          </div>
          <Link
            href="/dashboard/courses/new"
            className="text-xs font-bold text-[#026BCA] hover:underline dark:text-[#00BCE4]"
          >
            + Crear nuevo curso
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {coursesTaught.map((course) => (
            <div
              key={course.id}
              className="flex flex-col justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 shadow-xs transition-all hover:border-[#026BCA] dark:hover:border-[#00BCE4]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="border border-blue-200 dark:border-blue-900/60 bg-[#EDF6FF] dark:bg-blue-950/40 px-2 py-0.5 text-[10px] font-bold text-[#00155C] dark:text-[#00BCE4]">
                    {course._count.enrollments} alumnos inscritos
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {course._count.sections} secciones
                  </span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-[#00155C] dark:text-white line-clamp-2">
                  {course.title}
                </h3>
                {course.description && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="mt-5 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                  <Link
                    href={`/dashboard/courses/${course.id}/questions`}
                    className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1.5 font-bold text-slate-700 dark:text-slate-300 hover:bg-[#EDF6FF] hover:text-[#00155C] transition flex flex-col items-center gap-0.5"
                  >
                    <BookIcon size={13} className="text-[#026BCA]" />
                    <span className="text-[9px]">Preguntas</span>
                  </Link>
                  <Link
                    href={`/dashboard/courses/${course.id}/grades`}
                    className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1.5 font-bold text-slate-700 dark:text-slate-300 hover:bg-[#EDF6FF] hover:text-[#00155C] transition flex flex-col items-center gap-0.5"
                  >
                    <BarChartIcon size={13} className="text-[#12AC81]" />
                    <span className="text-[9px]">Notas</span>
                  </Link>
                  <Link
                    href={`/dashboard/courses/${course.id}/reports`}
                    className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 p-1.5 font-bold text-slate-700 dark:text-slate-300 hover:bg-[#EDF6FF] hover:text-[#00155C] transition flex flex-col items-center gap-0.5"
                  >
                    <CheckCircleIcon size={13} className="text-[#ECD06F]" />
                    <span className="text-[9px]">Reportes</span>
                  </Link>
                </div>

                <Link
                  href={`/dashboard/courses/${course.id}`}
                  className="block w-full bg-[#00155C] py-2 text-center text-xs font-bold text-white hover:bg-[#026BCA] transition dark:bg-[#026BCA] dark:hover:bg-[#00BCE4] dark:hover:text-[#00155C]"
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
