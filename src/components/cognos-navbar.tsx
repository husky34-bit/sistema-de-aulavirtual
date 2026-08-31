'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  SearchIcon,
} from '@/components/Icons';

interface CognosNavbarProps {
  canManageUsers?: boolean;
}

export function CognosNavbar({ canManageUsers }: CognosNavbarProps) {
  const pathname = usePathname();
  const [editMode, setEditMode] = useState(false);
  const [showAboutMenu, setShowAboutMenu] = useState(false);

  const isPersonalArea = pathname === '/dashboard';
  const isMyCourses = pathname.startsWith('/dashboard/courses');
  const isCalendar = pathname.startsWith('/dashboard/calendar');
  const isGrades = pathname.startsWith('/dashboard/grades');
  const isSearch = pathname.startsWith('/dashboard/search');
  const isCorporate = pathname.startsWith('/dashboard/reports/corporate');

  return (
    <div className="bg-[#343A40] text-white border-b border-[#212529] shadow-xs">
      <div className="mx-auto flex w-full max-w-[1780px] items-center justify-between px-4 sm:px-8 lg:px-12 2xl:px-16 text-xs sm:text-[13px] font-medium tracking-wide">
        {/* Enlaces Principales de Navegación */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
          {/* Botón Home / Inicio */}
          <Link
            href="/dashboard"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-700/80 text-white hover:bg-slate-600 transition"
            title="Inicio"
          >
            <HomeIcon size={14} />
          </Link>

          {/* Área personal */}
          <Link
            href="/dashboard"
            className={`relative px-3 py-2 transition hover:text-white ${
              isPersonalArea
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Área personal
          </Link>

          {/* Mis cursos */}
          <Link
            href="/dashboard/courses"
            className={`relative px-3 py-2 transition hover:text-white ${
              isMyCourses
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Mis cursos
          </Link>

          {/* Mis Notas / Calificaciones */}
          <Link
            href="/dashboard/grades"
            className={`relative px-3 py-2 transition hover:text-white ${
              isGrades
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Calificaciones
          </Link>

          {/* NOSOTROS (Dropdown institucional) */}
          <div
            className="relative"
            onMouseEnter={() => setShowAboutMenu(true)}
            onMouseLeave={() => setShowAboutMenu(false)}
          >
            <button
              type="button"
              onClick={() => setShowAboutMenu((p) => !p)}
              className="flex items-center gap-1 px-3 py-2 uppercase text-slate-300 hover:text-white transition"
            >
              <span>NOSOTROS</span>
              <span className="text-[10px]">⌵</span>
            </button>

            {showAboutMenu && (
              <div className="absolute left-0 top-full z-50 w-48 border border-slate-700 bg-[#343A40] py-1 shadow-xl text-xs">
                <a
                  href="https://cognos.edu.bo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-slate-700 text-slate-200"
                >
                  Acerca de Cognos
                </a>
                <a
                  href="https://cognos.edu.bo/certificaciones"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-slate-700 text-slate-200"
                >
                  Certificaciones Oficiales
                </a>
                <a
                  href="https://cognos.edu.bo/docentes"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-4 py-2 hover:bg-slate-700 text-slate-200"
                >
                  Cuerpo Docente
                </a>
              </div>
            )}
          </div>

          {/* CRONOGRAMA (Calendario) */}
          <Link
            href="/dashboard/calendar"
            className={`relative px-3 py-2 uppercase transition hover:text-white ${
              isCalendar
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            CRONOGRAMA
          </Link>

          {/* FRANQUICIA / SEDES */}
          <Link
            href="/dashboard/reports/corporate"
            className={`relative px-3 py-2 uppercase transition hover:text-white ${
              isCorporate
                ? 'font-bold text-white after:absolute after:bottom-0 after:left-0 after:h-[3px] after:w-full after:bg-[#00BCE4]'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            FRANQUICIA
          </Link>

          {/* CONTACTO */}
          <Link
            href="/dashboard/messages"
            className="px-3 py-2 uppercase text-slate-300 hover:text-white transition"
          >
            CONTACTO
          </Link>

          {/* Accesos de Administrador / Docente */}
          {canManageUsers && (
            <div className="flex items-center gap-1 border-l border-slate-600 pl-2">
              <Link
                href="/dashboard/reports/builder"
                className="px-2.5 py-1.5 text-xs text-[#ECD06F] hover:bg-white/10 font-bold"
              >
                Reportes
              </Link>
              <Link
                href="/admin/users"
                className="px-2.5 py-1.5 text-xs text-cyan-300 hover:bg-white/10"
              >
                Usuarios
              </Link>
            </div>
          )}
        </div>

        {/* Acciones del lado derecho: Modo de edición & Búsqueda */}
        <div className="flex items-center gap-3 shrink-0 py-1">
          {/* Modo de edición Toggle */}
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="hidden md:inline text-[12px]">Modo de edición</span>
            <button
              type="button"
              onClick={() => setEditMode((prev) => !prev)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                editMode ? 'bg-[#00BCE4]' : 'bg-slate-600'
              }`}
              title={editMode ? 'Modo de edición activado' : 'Modo de edición desactivado'}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  editMode ? 'translate-x-4.5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>

          {/* Botón de Búsqueda */}
          <Link
            href="/dashboard/search"
            className={`flex h-7 w-7 items-center justify-center rounded-full bg-slate-700/80 text-slate-300 hover:bg-slate-600 hover:text-white transition ${
              isSearch ? 'text-white bg-[#00BCE4]' : ''
            }`}
            title="Buscar en cursos y recursos"
          >
            <SearchIcon size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
