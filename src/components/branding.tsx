import Link from "next/link";
import { auth } from "@/auth";
import Image from "next/image";

export function ZenviaLogo({ variant = "light" }: { variant?: "light" | "dark" }) {
  void variant;
  return (
    <Link href="/" className="group flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-95">
      {/* Cognos Logo Real */}
      <div className="relative flex items-center bg-white rounded-md px-2.5 py-1 shadow-sm ring-1 ring-white/20">
        <Image
          src="/images/logos/cognos-virtual-moodle.png"
          alt="Cognos Virtual"
          width={180}
          height={48}
          className="h-7 md:h-8 w-auto object-contain"
          priority
        />
      </div>
    </Link>
  );
}

export async function UserBadge() {
  const session = await auth();
  if (!session?.user) return null;

  const role = session.user.role ?? "STUDENT";
  const initials = (session.user.name ?? session.user.email ?? "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const roleConfig: Record<string, { label: string; badgeClass: string }> = {
    ADMIN: { label: "Administrador", badgeClass: "bg-red-500/15 text-red-300 ring-red-500/30" },
    TEACHER: { label: "Docente", badgeClass: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
    MANAGER: { label: "Gestor", badgeClass: "bg-purple-500/15 text-purple-300 ring-purple-500/30" },
    STUDENT: { label: "Estudiante", badgeClass: "bg-blue-500/15 text-[#00BCE4] ring-[#00BCE4]/30" },
  };

  const currentRole = roleConfig[role] ?? {
    label: role,
    badgeClass: "bg-slate-500/15 text-slate-300 ring-slate-400/30",
  };

  return (
    <Link
      href="/dashboard/profile"
      className="group flex items-center gap-3 rounded-full bg-[#002147]/90 px-3.5 py-1.5 ring-1 ring-white/10 shadow-inner transition-all hover:ring-white/30 hover:scale-[1.02] active:scale-95"
      title="Ver mi perfil y cambiar contraseña"
    >
      <div className="text-right">
        <p className="text-xs font-semibold text-white leading-tight group-hover:text-[#00BCE4] transition">
          {session.user.name ?? "Usuario"}
        </p>
        <span className={`inline-block text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded ring-1 ${currentRole.badgeClass}`}>
          {currentRole.label}
        </span>
      </div>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#026BCA] to-[#00155C] text-xs font-bold text-white shadow-md ring-2 ring-[#00BCE4]/50 group-hover:ring-white">
        {initials}
      </div>
    </Link>
  );
}
