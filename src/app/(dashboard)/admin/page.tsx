import Link from "next/link";
import { requireRole } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import {
  UsersIcon,
  BookOpenIcon,
  BarChartIcon,
  ShieldCheckIcon,
  SettingsIcon,
  LockIcon,
  LayersIcon,
} from "@/components/Icons";

export const metadata = {
  title: "Administración del Sitio",
};

export default async function AdminSitePage() {
  await requireRole(["ADMIN", "MANAGER"]);

  const [
    totalUsers,
    totalCourses,
    totalStudents,
    totalTeachers,
    totalCohorts,
    totalAuditLogs,
    totalTokens,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.cohort.count().catch(() => 0),
    prisma.auditLog.count().catch(() => 0),
    prisma.apiToken.count().catch(() => 0),
  ]);

  const adminModules = [
    {
      title: "Usuarios y Cuentas",
      description: "Control de acceso, roles institucionales, cohortes y matriculación de estudiantes.",
      icon: UsersIcon,
      color: "text-blue-600 dark:text-[#00BCE4] bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900",
      links: [
        { label: "Gestión de Usuarios y Roles", href: "/users", description: "Ver lista completa, cambiar roles (Admin, Docente, Alumno)." },
        { label: "Administración de Cohortes", href: "/admin/cohorts", description: "Grupos masivos y sincronización de matrículas." },
      ],
    },
    {
      title: "Cursos y Programas Académicos",
      description: "Creación oficial de programas, asignación de docentes e instructores y gestión de catálogo.",
      icon: BookOpenIcon,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900",
      links: [
        { label: "+ Crear Nuevo Curso Oficial", href: "/dashboard/courses/new", description: "Añadir un nuevo curso al catálogo y designar docente a cargo." },
        { label: "Catálogo y Gestión de Cursos", href: "/dashboard/courses", description: "Editar módulos, contenidos, foros y evaluaciones." },
      ],
    },
    {
      title: "Informes y Calificaciones",
      description: "Generador de métricas, portal corporativo B2B y libro de calificaciones institucional.",
      icon: BarChartIcon,
      color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900",
      links: [
        { label: "Generador de Reportes Personalizados", href: "/dashboard/reports/builder", description: "Filtros dinámicos de rendimiento y exportación." },
        { label: "Portal Corporativo B2B y Sedes", href: "/dashboard/reports/corporate", description: "Monitoreo por sucursales y clientes empresariales." },
        { label: "Libro de Calificaciones Global", href: "/dashboard/grades", description: "Supervisión de actas y notas finales de todos los cursos." },
      ],
    },
    {
      title: "Servidor, API y Seguridad",
      description: "Registro de auditoría del sistema, claves de integración REST y ajustes globales.",
      icon: ShieldCheckIcon,
      color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900",
      links: [
        { label: "Registro de Auditoría (Audit Log)", href: "/admin/audit-log", description: "Trazabilidad de eventos, cambios y accesos con fecha y usuario." },
        { label: "Tokens de Integración (API REST v1)", href: "/dashboard/settings/tokens", description: "Crear y revocar credenciales de conexión externa." },
        { label: "Configuración General del Sitio", href: "/admin/settings", description: "Parámetros globales de la plataforma y variables operativas." },
      ],
    },
  ];

  return (
    <div className="space-y-8 font-poppins">
      {/* Encabezado Principal */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="inline-flex items-center gap-1.5 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
          <ShieldCheckIcon size={12} className="shrink-0" />
          <span>Panel Maestro · Cognos LMS</span>
        </div>

        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#00155C] dark:text-white tracking-tight">
          Administración del sitio
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Centro de control institucional para la configuración global, cuentas de usuarios, catálogo académico, informes y seguridad.
        </p>
      </div>

      {/* Métricas Globales de la Plataforma */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Usuarios</p>
          <p className="mt-2 text-2xl font-black text-[#00155C] dark:text-white">{totalUsers}</p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estudiantes</p>
          <p className="mt-2 text-2xl font-black text-[#12AC81]">{totalStudents}</p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Docentes</p>
          <p className="mt-2 text-2xl font-black text-[#026BCA] dark:text-[#00BCE4]">{totalTeachers}</p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cursos</p>
          <p className="mt-2 text-2xl font-black text-[#00155C] dark:text-white">{totalCourses}</p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Cohortes</p>
          <p className="mt-2 text-2xl font-black text-[#ECD06F]">{totalCohorts}</p>
        </div>

        <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tokens API</p>
          <p className="mt-2 text-2xl font-black text-cyan-400">{totalTokens}</p>
        </div>
      </div>

      {/* Secciones de Administración por Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {adminModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.title}
              className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101D31] p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className={`flex h-10 w-10 items-center justify-center border ${mod.color}`}>
                    <Icon size={20} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-[#00155C] dark:text-white">{mod.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{mod.description}</p>
                  </div>
                </div>

                <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
                  {mod.links.map((link) => (
                    <li key={link.href} className="py-3 group">
                      <Link
                        href={link.href}
                        className="flex items-start justify-between gap-2 text-xs font-bold text-[#00155C] dark:text-white group-hover:text-[#026BCA] dark:group-hover:text-[#00BCE4] transition"
                      >
                        <div>
                          <span>{link.label}</span>
                          <p className="mt-0.5 text-[11px] font-normal text-slate-500 dark:text-slate-400">
                            {link.description}
                          </p>
                        </div>
                        <span className="text-slate-400 group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
