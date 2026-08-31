import Link from "next/link";
import { ZenviaLogo } from "@/components/branding";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { MobileNav } from "@/components/MobileNav";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { MessageBell } from "@/features/messaging/components/message-bell";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getCurrentUser } from "@/lib/auth-helpers";
import {
  AwardIcon,
  BarChartIcon,
  BookOpenIcon,
  CalendarIcon,
  HomeIcon,
  MessageSquareIcon,
  SearchIcon,
} from "@/components/Icons";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const canManageUsers = user?.role === "ADMIN";

  return (
    <div className="dashboard-shell min-h-screen flex flex-col justify-between">
      <div>
        <header className="sticky top-0 z-40 border-b border-[#002147] bg-[#00155C] shadow-md shadow-[#00155C]/20">
          <div className="relative mx-auto flex w-full max-w-[1780px] items-center justify-between gap-3 px-4 py-3 sm:px-8 lg:px-12 2xl:px-16">
            <div className="shrink-0">
              <ZenviaLogo variant="light" />
            </div>

            {/* Se muestra solo cuando hay espacio; al hacer zoom se convierte en menú móvil. */}
            <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 text-[13px] font-medium text-slate-200 xl:flex font-poppins">
                <Link
                  href="/dashboard"
                  className="dashboard-nav-link"
                >
                  <HomeIcon size={15} /> Inicio
                </Link>
                <Link
                  href="/dashboard/courses"
                  className="dashboard-nav-link"
                >
                  <BookOpenIcon size={15} /> Cursos
                </Link>
                <Link
                  href="/dashboard/grades"
                  className="dashboard-nav-link"
                >
                  <BarChartIcon size={15} /> Mis Notas
                </Link>
                <Link
                  href="/dashboard/messages"
                  className="dashboard-nav-link"
                >
                  <MessageSquareIcon size={15} /> Mensajes
                </Link>
                <Link
                  href="/dashboard/calendar"
                  className="dashboard-nav-link"
                >
                  <CalendarIcon size={15} /> Calendario
                </Link>
                <Link
                  href="/dashboard/badges"
                  className="dashboard-nav-link"
                >
                  <AwardIcon size={15} /> Insignias
                </Link>
                <Link
                  href="/dashboard/search"
                  className="dashboard-nav-link text-[#00BCE4]"
                >
                  <SearchIcon size={15} /> Buscar
                </Link>
                {canManageUsers && (
                  <div className="ml-2 flex items-center gap-1 border-l border-white/20 pl-3">
                    <Link
                      href="/dashboard/reports/corporate"
                      className="rounded-lg px-2.5 py-1 text-xs text-[#00BCE4] hover:bg-white/10 transition font-bold"
                    >
                      B2B & Sedes
                    </Link>
                    <Link
                      href="/dashboard/reports/builder"
                      className="rounded-lg px-2.5 py-1 text-xs text-[#ECD06F] hover:bg-white/10 transition flex items-center gap-1"
                    >
                      <BarChartIcon size={13} className="shrink-0" /> Reportes
                    </Link>
                    <Link
                      href="/admin/users"
                      className="rounded-lg px-2.5 py-1 text-xs text-cyan-300 hover:bg-white/10 transition"
                    >
                      Usuarios
                    </Link>
                    <Link
                      href="/dashboard/settings/tokens"
                      className="rounded-lg px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 transition"
                    >
                      API Tokens
                    </Link>
                  </div>
                )}
            </nav>

            {/* Acciones de usuario a la derecha (Notificaciones, Mensajes, Menú Perfil y Tema) */}
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <div className="hidden sm:block"><NotificationBell /></div>
              <div className="hidden sm:block"><MessageBell /></div>
              {user && <UserProfileMenu user={user} />}
              {/* El menú se activa también al reducir el espacio mediante zoom. */}
              <div className="xl:hidden">
                <MobileNav canManageUsers={canManageUsers} />
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1780px] px-4 py-6 sm:px-8 lg:px-12 2xl:px-16">
          {children}
        </main>
      </div>

      {/* Footer Cognos */}
      <footer className="mt-16 border-t border-white/10 bg-[#00155C] text-white py-6">
        <div className="mx-auto flex max-w-[1780px] flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-8 lg:px-12 2xl:px-16 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">COGNOS CAPACITACIÓN</span>
            <span>·</span>
            <span>Plataforma de Aprendizaje Virtual</span>
          </div>
          <p>© {new Date().getFullYear()} Grupo Cognos. Todos los derechos reservados.</p>
        </div>
      </footer>

      {/* Floating WhatsApp Support Button */}
      <WhatsAppButton />
    </div>
  );
}
