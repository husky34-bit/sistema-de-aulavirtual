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
  return (
    <div className="space-y-8 font-poppins">
      {/* Banner Superior Administrador */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00155C] via-[#002147] to-[#0B172B] p-8 text-white shadow-xl shadow-[#00155C]/20 ring-1 ring-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#026BCA]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3.5 py-1 text-xs font-bold text-red-300 ring-1 ring-red-500/30 backdrop-blur-sm">
              <GraduationCapIcon size={14} className="shrink-0" /> PANEL DE CONTROL INSTITUCIONAL · COGNOS
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl font-poppins">
              ¡Bienvenido, {user.name ?? "Administrador"}!
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl font-normal leading-relaxed">
              Supervisa el rendimiento académico global, gestiona usuarios y cohortes, configura cursos de alta demanda y audita las actividades de la plataforma.
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
              href="/dashboard/reports/corporate"
              className="inline-flex items-center gap-2 rounded-xl border border-[#ECD06F]/40 bg-[#ECD06F]/15 px-4 py-2.5 text-sm font-bold text-[#ECD06F] backdrop-blur-sm transition-all hover:bg-[#ECD06F]/25"
            >
              <span>🏢 Portal B2B & Sedes</span>
            </Link>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
            >
              <span>Usuarios</span>
            </Link>
          </div>
        </div>

        {/* Métricas Globales del LMS */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Cursos Registrados</p>
            <p className="text-2xl font-extrabold text-[#00BCE4]">{stats.totalCourses}</p>
            <span className="text-[10px] text-slate-400">Catálogo activo Cognos</span>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Estudiantes Activos</p>
            <p className="text-2xl font-extrabold text-[#12AC81]">{stats.totalStudents}</p>
            <span className="text-[10px] text-slate-400">Matrículas verificadas</span>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Docentes / Instructores</p>
            <p className="text-2xl font-extrabold text-[#ECD06F]">{stats.totalTeachers}</p>
            <span className="text-[10px] text-slate-400">Especialistas certificados</span>
          </div>
          <div className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-md">
            <p className="text-xs font-semibold text-slate-300">Evaluaciones Activas</p>
            <p className="text-2xl font-extrabold text-cyan-300">{stats.totalQuizzes}</p>
            <span className="text-[10px] text-slate-400">Cuestionarios & Exámenes</span>
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
