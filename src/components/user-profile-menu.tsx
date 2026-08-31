'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { logoutAction } from '@/features/auth/actions/logout';

interface UserProfileMenuProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: string;
  };
}

export function UserProfileMenu({ user }: UserProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLanguageSubmenu, setShowLanguageSubmenu] = useState(false);
  const [currentLang, setCurrentLang] = useState<'es' | 'en'>('es');
  const menuRef = useRef<HTMLDivElement>(null);

  const displayName = user.name || user.email?.split('@')[0] || 'Usuario';
  const initial = displayName[0]?.toUpperCase() || 'U';

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowLanguageSubmenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative font-poppins" ref={menuRef}>
      {/* Botón Trigger (Nombre + Flecha + Avatar) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 rounded-full py-1 pl-3 pr-1 text-left transition-all hover:bg-white/10 active:scale-95"
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
          {displayName}
        </span>
        <svg
          className={`h-4 w-4 text-slate-300 transition-transform ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>

        {/* Avatar Circular */}
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/50 bg-gradient-to-br from-[#026BCA] to-[#00155C] text-xs font-bold text-white shadow-sm">
          {user.image ? (
            <img src={user.image} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
      </button>

      {/* Menú Desplegable (Estilo idéntico a Moodle / Captura) */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101D31] py-1.5 shadow-xl text-xs text-slate-700 dark:text-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
          >
            Perfil
          </Link>

          <Link
            href="/dashboard/grades"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
          >
            Calificaciones
          </Link>

          <Link
            href="/dashboard/calendar"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
          >
            Calendario
          </Link>

          <Link
            href="/dashboard/courses"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
          >
            Archivos privados
          </Link>

          <Link
            href="/dashboard/reports"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
          >
            Informes
          </Link>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          <Link
            href="/dashboard/profile"
            onClick={() => setIsOpen(false)}
            className="flex items-center px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
          >
            Preferencias
          </Link>

          {/* Selector de Idioma con submenú */}
          <div
            className="relative"
            onMouseEnter={() => setShowLanguageSubmenu(true)}
            onMouseLeave={() => setShowLanguageSubmenu(false)}
          >
            <button
              type="button"
              onClick={() => setShowLanguageSubmenu((prev) => !prev)}
              className="flex w-full items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left"
            >
              <span>Idioma</span>
              <span className="text-[10px] text-slate-400 font-bold">›</span>
            </button>

            {showLanguageSubmenu && (
              <div className="absolute right-full top-0 mr-1 w-36 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101D31] py-1 shadow-xl z-50">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLang('es');
                    setShowLanguageSubmenu(false);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-xs ${
                    currentLang === 'es' ? 'font-bold text-[#00155C] dark:text-[#00BCE4]' : ''
                  }`}
                >
                  <span>Español (es)</span>
                  {currentLang === 'es' && <span>✓</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLang('en');
                    setShowLanguageSubmenu(false);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-1.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 text-xs ${
                    currentLang === 'en' ? 'font-bold text-[#00155C] dark:text-[#00BCE4]' : ''
                  }`}
                >
                  <span>English (en)</span>
                  {currentLang === 'en' && <span>✓</span>}
                </button>
              </div>
            )}
          </div>

          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          {/* Cerrar Sesión */}
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 dark:text-slate-200 dark:hover:bg-red-950/40 dark:hover:text-red-300 transition-colors"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar sesión</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
