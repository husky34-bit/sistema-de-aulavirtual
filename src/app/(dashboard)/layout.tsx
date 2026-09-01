import { ZenviaLogo } from "@/components/branding";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { MobileNav } from "@/components/MobileNav";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { MessageBell } from "@/features/messaging/components/message-bell";
import { CognosNavbar } from "@/components/cognos-navbar";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getCurrentUser } from "@/lib/auth-helpers";
import { ThemeToggle } from "@/components/theme-toggle";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionUser = await getCurrentUser();
  const canManageUsers = sessionUser?.role === "ADMIN";

  const user = sessionUser?.id
    ? await prisma.user.findUnique({
        where: { id: sessionUser.id },
        select: { id: true, name: true, email: true, image: true, role: true },
      })
    : null;

  return (
    <div className="dashboard-shell min-h-screen flex flex-col justify-between">
      <div>
        {/* Cabecera Auténtica Cognos LMS (Doble Barra: Superior Blanca + Inferior Plomo) */}
        <header className="sticky top-0 z-40 shadow-sm font-poppins">
          {/* Fila Superior: Fondo Blanco con Borde Azul Cognos */}
          <div className="border-t-[3px] border-t-[#00155C] border-b border-slate-200 bg-white dark:bg-[#101D31] dark:border-slate-800 transition-colors">
            <div className="flex w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 py-2.5">
              <div className="shrink-0">
                <ZenviaLogo variant="light" />
              </div>

              {/* Acciones de usuario a la derecha (Notificaciones, Mensajes, Menú Perfil y Tema) */}
              <div className="flex shrink-0 items-center gap-2.5 sm:gap-4">
                <ThemeToggle />
                <div className="hidden sm:block"><NotificationBell /></div>
                <div className="hidden sm:block"><MessageBell /></div>
                {user && <UserProfileMenu user={user} />}
                {/* Menú móvil */}
                <div className="xl:hidden">
                  <MobileNav canManageUsers={canManageUsers} />
                </div>
              </div>
            </div>
          </div>

          {/* Fila Inferior: Barra de Navegación Plomo / Grafito */}
          <CognosNavbar canManageUsers={canManageUsers} />
        </header>

        <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>

      {/* Footer Cognos */}
      <footer className="mt-16 border-t border-white/10 bg-[#00155C] text-white py-6">
        <div className="flex w-full flex-col items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 sm:flex-row text-xs text-slate-300">
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
