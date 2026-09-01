'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  BookOpenIcon,
  BarChartIcon,
  MessageSquareIcon,
  CalendarIcon,
  AwardIcon,
  SearchIcon,
} from '@/components/Icons';

interface CognosNavbarProps {
  canManageUsers?: boolean;
}

export function CognosNavbar({ canManageUsers }: CognosNavbarProps) {
  const pathname = usePathname();

  const isHome = pathname === '/dashboard';
  const isCourses = pathname.startsWith('/dashboard/courses');
  const isGrades = pathname.startsWith('/dashboard/grades');
  const isMessages = pathname.startsWith('/dashboard/messages');
  const isCalendar = pathname.startsWith('/dashboard/calendar');
  const isBadges = pathname.startsWith('/dashboard/badges');
  const isSearch = pathname.startsWith('/dashboard/search');

  return (
    <div className="bg-[#343A40] text-white border-b border-[#212529] shadow-xs">
      <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8 text-xs sm:text-[13.5px] font-medium tracking-wide">
        {/* Enlaces de Navegación Anteriores (Restaurados) */}
        <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto py-0.5 scrollbar-none">
          {/* Inicio */}
          <Link
            href="/dashboard"
            className={`relative flex items-center gap-1.5 px-3 py-2.5 transition hover:text-white ${
              isHome
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <HomeIcon size={16} />
            <span>Inicio</span>
          </Link>

          {/* Cursos */}
          <Link
            href="/dashboard/courses"
            className={`relative flex items-center gap-1.5 px-3 py-2.5 transition hover:text-white ${
              isCourses
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <BookOpenIcon size={16} />
            <span>Cursos</span>
          </Link>

          {/* Mis Notas */}
          <Link
            href="/dashboard/grades"
            className={`relative flex items-center gap-1.5 px-3 py-2.5 transition hover:text-white ${
              isGrades
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <BarChartIcon size={16} />
            <span>Mis Notas</span>
          </Link>

          {/* Mensajes */}
          <Link
            href="/dashboard/messages"
            className={`relative flex items-center gap-1.5 px-3 py-2.5 transition hover:text-white ${
              isMessages
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <MessageSquareIcon size={16} />
            <span>Mensajes</span>
          </Link>

          {/* Calendario */}
          <Link
            href="/dashboard/calendar"
            className={`relative flex items-center gap-1.5 px-3 py-2.5 transition hover:text-white ${
              isCalendar
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <CalendarIcon size={16} />
            <span>Calendario</span>
          </Link>

          {/* Insignias */}
          <Link
            href="/dashboard/badges"
            className={`relative flex items-center gap-1.5 px-3 py-2.5 transition hover:text-white ${
              isBadges
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <AwardIcon size={16} />
            <span>Insignias</span>
          </Link>

          {/* Buscar */}
          <Link
            href="/dashboard/search"
            className={`relative flex items-center gap-1.5 px-3 py-2.5 transition hover:text-white ${
              isSearch
                ? 'font-bold text-[#00BCE4] after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-[#00BCE4] hover:text-white'
            }`}
          >
            <SearchIcon size={16} />
            <span>Buscar</span>
          </Link>

          {/* Enlaces de Administrador */}
          {canManageUsers && (
            <div className="ml-2 flex items-center gap-1 border-l border-slate-600 pl-3">
              <Link
                href="/dashboard/reports/corporate"
                className="rounded-md px-2.5 py-1 text-xs font-bold text-[#00BCE4] hover:bg-white/10 transition"
              >
                B2B & Sedes
              </Link>
              <Link
                href="/dashboard/reports/builder"
                className="rounded-md px-2.5 py-1 text-xs font-bold text-[#ECD06F] hover:bg-white/10 transition flex items-center gap-1"
              >
                <BarChartIcon size={13} className="shrink-0" />
                <span>Reportes</span>
              </Link>
              <Link
                href="/admin/users"
                className="rounded-md px-2.5 py-1 text-xs text-cyan-300 hover:bg-white/10 transition"
              >
                Usuarios
              </Link>
              <Link
                href="/dashboard/settings/tokens"
                className="rounded-md px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 transition"
              >
                API Tokens
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
