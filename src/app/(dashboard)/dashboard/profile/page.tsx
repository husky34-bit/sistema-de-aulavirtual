import { requireAuth } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChangePasswordForm } from "@/features/auth/components/change-password-form";
import { EditProfileNameForm } from "@/features/users/components/edit-profile-name-form";
import { UsersIcon, BookOpenIcon, CalendarIcon } from "@/components/Icons";

export const metadata = {
  title: "Mi Perfil",
};

export default async function ProfilePage() {
  const sessionUser = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const roleConfig: Record<string, { label: string; badgeClass: string; desc: string }> = {
    ADMIN: {
      label: "Administrador",
      badgeClass: "bg-red-500/15 text-red-700 ring-red-500/30",
      desc: "Control total de la plataforma, cursos y usuarios",
    },
    TEACHER: {
      label: "Docente",
      badgeClass: "bg-amber-500/15 text-amber-700 ring-amber-500/30",
      desc: "Gestión de contenidos, evaluaciones y alumnos",
    },
    MANAGER: {
      label: "Gestor",
      badgeClass: "bg-purple-500/15 text-purple-700 ring-purple-500/30",
      desc: "Supervisión académica y reportes",
    },
    STUDENT: {
      label: "Estudiante",
      badgeClass: "bg-blue-500/15 text-[#026BCA] ring-[#026BCA]/30",
      desc: "Acceso a cursos, evaluaciones y materiales de estudio",
    },
  };

  const roleInfo = roleConfig[user.role] ?? {
    label: user.role,
    badgeClass: "bg-slate-500/15 text-slate-700 ring-slate-400/30",
    desc: "Usuario de la plataforma",
  };

  const initials = (user.name ?? user.email ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8 font-poppins max-w-5xl">
      {/* Header Banner de Perfil */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#00155C] via-[#002147] to-[#0A1A3A] p-8 text-white shadow-xl shadow-[#00155C]/20 ring-1 ring-white/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-56 w-56 rounded-full bg-[#026BCA]/20 blur-3xl" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#026BCA] to-[#00BCE4] text-2xl font-black text-white shadow-lg ring-4 ring-white/20">
            {initials}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl font-extrabold text-white">
                {user.name ?? "Usuario Cognos"}
              </h1>
              <span
                className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ring-1 ${roleInfo.badgeClass}`}
              >
                {roleInfo.label}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{user.email}</p>
            <p className="mt-2 text-xs text-slate-400 max-w-xl">{roleInfo.desc}</p>
          </div>
        </div>
      </div>

      {/* Grid de Resumen de Cuenta */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF6FF] text-[#026BCA]">
              <BookOpenIcon size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cursos Matriculados
              </p>
              <p className="text-2xl font-extrabold text-[#00155C]">
                {user._count.enrollments}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDF6FF] text-[#026BCA]">
              <CalendarIcon size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Miembro Desde
              </p>
              <p className="text-sm font-bold text-[#00155C]">
                {new Date(user.createdAt).toLocaleDateString("es-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Privacidad y Datos
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Descarga tu expediente y registros de actividad.
            </p>
          </div>
          <Link
            href="/dashboard/profile/data"
            className="mt-3 inline-flex items-center text-xs font-bold text-[#026BCA] hover:underline"
          >
            Descargar mis datos JSON →
          </Link>
        </div>
      </div>

      {/* Editar Nombre de Usuario */}
      <EditProfileNameForm
        initialName={user.name ?? ""}
        email={user.email}
        roleLabel={roleInfo.label}
      />

      {/* Formulario de Cambio de Contraseña */}
      <ChangePasswordForm />
    </div>
  );
}
