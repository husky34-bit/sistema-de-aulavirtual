import Link from "next/link";
import {
  BookOpenIcon,
  UsersIcon,
  BarChartIcon,
  GraduationCapIcon,
  SaveIcon,
  CheckCircleIcon,
  SearchIcon,
  SchoolIcon,
} from "@/components/Icons";

interface AdminDashboardProps {
  user: { name?: string | null; email?: string | null; role: string };
  stats: {
    totalCourses: number;
    totalStudents: number;
    totalTeachers: number;
    totalQuizzes: number;
  };
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    published: boolean;
    instructor: { name: string | null };
    _count: { enrollments: number; sections: number; quizzes: number; assignments: number };
  }>;
}

export function AdminDashboard({ user, stats, courses }: AdminDashboardProps) {
  const displayName = user.name ?? "Administrador";

  return (
    <div className="space-y-6 font-poppins">
      {/* Encabezado Minimalista Administrador */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
            <GraduationCapIcon size={12} className="shrink-0" />
            <span>Panel Maestro · Cognos LMS</span>
          </div>

          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#00155C] dark:text-white tracking-tight">
            ¡Bienvenido, {displayName}!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Supervisa el rendimiento académico global, administra usuarios, crea y asigna cursos, y gestiona la seguridad del sitio.
          </p>
        </div>

        {/* Acciones Rápidas del Administrador */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/courses/new"
            className="inline-flex items-center gap-2 bg-[#00155C] px-4 py-2 text-xs font-bold text-white hover:bg-[#026BCA] transition dark:bg-[#026BCA] dark:hover:bg-[#00BCE4] dark:hover:text-[#00155C]"
          >
            <span>+ Crear Nuevo Curso</span>
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101D31] px-4 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            <span>⚙️ Administración del sitio</span>
          </Link>
          <Link
            href="/dashboard/reports/corporate"
            className="inline-flex items-center gap-2 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2 text-xs font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100 transition"
          >
            <span>🏢 Portal B2B</span>
          </Link>
        </div>
      </div>

      {/* Métricas Globales Cuadradas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#026BCA] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Cursos Registrados
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#00155C] dark:text-[#00BCE4]">
              <BookOpenIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#00155C] dark:text-white">
              {stats.totalCourses}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Programas en catálogo
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#12AC81] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estudiantes Activos
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#12AC81]">
              <UsersIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#12AC81]">
              {stats.totalStudents}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Matrículas vigentes
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-5 flex flex-col justify-between hover:border-[#ECD06F] transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Docentes / Instructores
            </span>
            <span className="flex h-8 w-8 items-center justify-center border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#ECD06F]">
              <GraduationCapIcon size={16} />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-[#00155C] dark:text-white">
              {stats.totalTeachers}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Especialistas asignados
            </p>
          </div>
        </div>

        {/* KPI 4 */}
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
            <p className="text-3xl font-extrabold text-cyan-500">
              {stats.totalQuizzes}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Exámenes y cuestionarios
            </p>
          </div>
        </div>
      </div>

      {/* Centro de Acciones Rápidas para Admin */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#00155C]">Centro de Operaciones y Herramientas</h2>
          <p className="text-xs text-slate-500">Acceso directo a los módulos de administración y auditoría</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/users"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF6FF] text-[#00155C] group-hover:bg-[#00155C] group-hover:text-white transition">
              <UsersIcon size={20} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#00155C]">Control de Usuarios</h3>
            <p className="mt-1 text-xs text-slate-500 font-normal">
              Administra estudiantes, docentes, asignación de roles y cohortes empresariales.
            </p>
          </Link>

          <Link
            href="/dashboard/reports/builder"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF6FF] text-[#00155C] group-hover:bg-[#00155C] group-hover:text-white transition">
              <BarChartIcon size={20} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#00155C]">Constructor de Reportes</h3>
            <p className="mt-1 text-xs text-slate-500 font-normal">
              Genera métricas de completitud, calificaciones y exportaciones a CSV compatibles con Excel.
            </p>
          </Link>

          <Link
            href="/dashboard/settings/tokens"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF6FF] text-[#00155C] group-hover:bg-[#00155C] group-hover:text-white transition">
              <SaveIcon size={20} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#00155C]">API Tokens & Integración</h3>
            <p className="mt-1 text-xs text-slate-500 font-normal">
              Conecta sistemas ERP, CRM y plataformas externas mediante tokens Bearer seguros.
            </p>
          </Link>

          <Link
            href="/dashboard/reports/corporate"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF8E6] text-[#C89B27] group-hover:bg-[#00155C] group-hover:text-white transition">
              <SchoolIcon size={20} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#00155C]">Portal Corporativo B2B</h3>
            <p className="mt-1 text-xs text-slate-500 font-normal">
              Supervisión de empresas, sedes/franquicias, asistencia del 80% y avance de colaboradores.
            </p>
          </Link>

          <Link
            href="/dashboard/search"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-[#026BCA] hover:shadow-lg"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF6FF] text-[#00155C] group-hover:bg-[#00155C] group-hover:text-white transition">
              <SearchIcon size={20} />
            </div>
            <h3 className="mt-3 text-sm font-bold text-[#00155C]">Búsqueda Global</h3>
            <p className="mt-1 text-xs text-slate-500 font-normal">
              Encuentra cualquier curso, recurso, evaluación o foro en toda la plataforma.
            </p>
          </Link>
        </div>
      </section>

      {/* Tabla de Gestión de Cursos Oficiales */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[#00155C]">Catálogo Institucional de Cursos</h2>
            <p className="text-xs text-slate-500">Supervisión en tiempo real de los cursos creados y matriculados</p>
          </div>
          <Link
            href="/dashboard/courses"
            className="text-xs font-bold text-[#026BCA] hover:underline"
          >
            Ver vista en tarjetas →
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-[#00155C] uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Curso / Programa</th>
                  <th className="px-4 py-3.5">Instructor</th>
                  <th className="px-4 py-3.5 text-center">Matrículas</th>
                  <th className="px-4 py-3.5 text-center">Módulos</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                  <th className="px-5 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EDF6FF] text-[#00155C] font-bold text-xs">
                          <BookOpenIcon size={16} />
                        </span>
                        <div>
                          <p className="font-bold text-[#00155C] text-sm leading-tight">{course.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{course.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">
                      {course.instructor.name ?? "Sin asignar"}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 font-bold text-[#026BCA]">
                        {course._count.enrollments} alumnos
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center font-medium">
                      {course._count.sections} secciones
                    </td>
                    <td className="px-4 py-4 text-center">
                      {course.published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircleIcon size={10} /> Publicado
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
                          Borrador
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/courses/${course.id}`}
                          className="rounded-lg bg-[#00155C] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#026BCA] transition"
                        >
                          Administrar
                        </Link>
                        <Link
                          href={`/dashboard/courses/${course.id}/grades`}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          Notas
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
