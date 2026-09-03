"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

/**
 * Navegación móvil para el dashboard.
 * Botón hamburguesa que despliega los enlaces y el botón de cerrar sesión
 * en pantallas pequeñas (visible solo con `md:hidden`). En desktop (>=768px)
 * la navegación horizontal del layout sigue activa.
 */
export function MobileNav({ canManageUsers }: { canManageUsers?: boolean }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/dashboard/courses", label: "Cursos" },
    { href: "/dashboard/grades", label: "Mis Notas" },
    { href: "/dashboard/messages", label: "Mensajes" },
    { href: "/dashboard/calendar", label: "Calendario" },
    { href: "/dashboard/badges", label: "Insignias" },
    { href: "/dashboard/profile", label: "Mi Perfil & Contraseña" },
    { href: "/dashboard/notifications", label: "Notificaciones" },
    { href: "/dashboard/settings/tokens", label: "Tokens de API" },
    { href: "/dashboard/profile/data", label: "Mis Datos" },
  ];

  if (canManageUsers) {
    links.push(
      { href: "/admin", label: "🛡️ Administración del sitio" },
      { href: "/users", label: "Usuarios" },
      { href: "/admin/cohorts", label: "Cohortes" },
      { href: "/admin/settings", label: "Configuración" },
      { href: "/admin/audit-log", label: "Auditoría" },
    );
  }

  return (
    <div className="xl:hidden">
      <div className="flex items-center gap-2">
        <NotificationBell />
        <button
          type="button"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 shadow-sm transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00BCE4]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {open ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="absolute left-0 right-0 top-full border-b border-slate-800 bg-[#00155C] px-4 py-4 shadow-2xl shadow-[#00155C]/40">
          <div className="flex flex-col gap-1 text-sm font-medium text-slate-300">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-3 border-t border-slate-800 pt-3">
              <LogoutButton />
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
