'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SearchIcon, CheckCircleIcon, XIcon } from '@/components/Icons';

export type AdminTabKey =
  | 'general'
  | 'usuarios'
  | 'cursos'
  | 'calificaciones'
  | 'extensiones'
  | 'apariencia'
  | 'servidor'
  | 'informes'
  | 'desarrollo';

interface AdminLink {
  label: string;
  href?: string;
  badge?: string;
}

interface AdminSection {
  title: string;
  titleColor?: 'navy' | 'amber';
  links: AdminLink[];
}

interface TabData {
  key: AdminTabKey;
  label: string;
  title: string;
  sections: AdminSection[];
}

const TABS_DATA: TabData[] = [
  {
    key: 'general',
    label: 'General',
    title: 'General',
    sections: [
      {
        title: 'Analítica',
        titleColor: 'navy',
        links: [
          { label: 'Modelos analíticos' },
          { label: 'Ajustes analíticos' },
        ],
      },
      {
        title: 'Competencias',
        titleColor: 'amber',
        links: [
          { label: 'Ajustes de competencias' },
          { label: 'Marcos de competencias' },
          { label: 'Plantillas de plan de aprendizaje' },
        ],
      },
      {
        title: 'Insignias',
        titleColor: 'amber',
        links: [
          { label: 'Ajustes de insignias', href: '/dashboard/badges' },
          { label: 'Gestionar insignias', href: '/dashboard/badges' },
          { label: 'Añadir una nueva insignia', href: '/dashboard/badges' },
        ],
      },
      {
        title: 'H5P',
        titleColor: 'amber',
        links: [{ label: 'Gestionar tipos de contenido H5P' }],
      },
      {
        title: 'Licencia',
        titleColor: 'amber',
        links: [{ label: 'Ajustes de licencia' }],
      },
      {
        title: 'Ubicación',
        titleColor: 'amber',
        links: [
          { label: 'Ajustes de ubicación' },
          { label: 'Zonas horarias' },
        ],
      },
      {
        title: 'Idiomas',
        titleColor: 'amber',
        links: [
          { label: 'Ajustes de idioma' },
          { label: 'Paquetes de idioma' },
        ],
      },
      {
        title: 'Seguridad',
        titleColor: 'amber',
        links: [
          { label: 'Políticas de seguridad del sitio' },
          { label: 'Protección HTTP' },
          { label: 'Notificaciones de administrador' },
        ],
      },
    ],
  },
  {
    key: 'usuarios',
    label: 'Usuarios',
    title: 'Usuarios',
    sections: [
      {
        title: 'Cuentas',
        titleColor: 'amber',
        links: [
          { label: 'Examinar lista de usuarios', href: '/users' },
          { label: 'Acciones de usuario masivas', href: '/users' },
          { label: 'Crear un nuevo usuario', href: '/users' },
          { label: 'Gestión de usuarios', href: '/users' },
          { label: 'Preferencias predeterminadas del usuario' },
          { label: 'Campos de perfil del usuario' },
          { label: 'Cohortes', href: '/admin/cohorts' },
          { label: 'Campos personalizados de cohorte', href: '/admin/cohorts' },
          { label: 'Subir usuarios', href: '/users' },
          { label: 'Subir imágenes de los usuarios' },
        ],
      },
      {
        title: 'Permisos',
        titleColor: 'amber',
        links: [
          { label: 'Políticas de usuario' },
          { label: 'Administradores del sitio', href: '/users' },
          { label: 'Definir roles', href: '/users' },
          { label: 'Asignar roles de sistema', href: '/users' },
          { label: 'Comprobar los permisos del sistema' },
          { label: 'Asignaciones no soportadas de rol.' },
          { label: 'Asignar roles de usuario a cohorte', href: '/admin/cohorts' },
          { label: 'Informe de permisos' },
        ],
      },
      {
        title: 'Privacidad y Políticas',
        titleColor: 'amber',
        links: [
          { label: 'Opciones de privacidad' },
          { label: 'Configuraciones de Política' },
          { label: 'Solicitudes de datos' },
          { label: 'Registro de datos' },
          { label: 'Eliminación de datos' },
          { label: 'Registro de privacidad de plugins' },
        ],
      },
    ],
  },
  {
    key: 'cursos',
    label: 'Cursos',
    title: 'Cursos',
    sections: [
      {
        title: 'Cursos',
        titleColor: 'navy',
        links: [
          { label: 'Administrar cursos y categorías', href: '/dashboard/courses' },
          { label: 'Añadir una categoría', href: '/dashboard/courses' },
          { label: 'Crear un nuevo curso', href: '/dashboard/courses/new' },
          { label: 'Restaurar curso' },
          { label: 'Descargar contenido del curso' },
          { label: 'Solicitud de curso' },
          { label: 'Solicitudes pendientes' },
          { label: 'Subir cursos' },
        ],
      },
      {
        title: 'Configuración por defecto',
        titleColor: 'amber',
        links: [
          { label: 'Ajustes por defecto del curso' },
          { label: 'Finalización de actividad por defecto' },
          { label: 'Campos personalizados del curso' },
        ],
      },
      {
        title: 'Grupos',
        titleColor: 'amber',
        links: [
          { label: 'Campos personalizados del grupo' },
          { label: 'Campos personalizados del agrupamiento' },
        ],
      },
      {
        title: 'Selector de actividades',
        titleColor: 'amber',
        links: [
          { label: 'Configuración del selector de actividades' },
          { label: 'Actividades recomendadas' },
        ],
      },
      {
        title: 'Copias de seguridad',
        titleColor: 'amber',
        links: [
          { label: 'Configuración por defecto de la copia de seguridad' },
          { label: 'Valores generales predeterminados de importación' },
          { label: 'Copia de seguridad programada' },
          { label: 'Valores por defecto generales de restauración' },
          { label: 'Copia de seguridad/restauración asincrónicos' },
        ],
      },
    ],
  },
  {
    key: 'calificaciones',
    label: 'Calificaciones',
    title: 'Calificaciones',
    sections: [
      {
        title: 'Calificaciones',
        titleColor: 'navy',
        links: [
          { label: 'Ajustes generales', href: '/dashboard/grades' },
          { label: 'Ajustes de categoría de calificación' },
          { label: 'Ajustes de ítems de calificación' },
          { label: 'Escalas' },
          { label: 'Letras' },
        ],
      },
      {
        title: 'Ajustes de informe',
        titleColor: 'amber',
        links: [
          { label: 'Informe del calificador', href: '/dashboard/grades' },
          { label: 'Historial de calificación', href: '/dashboard/grades' },
          { label: 'Informe general', href: '/dashboard/grades' },
          { label: 'Usuario', href: '/dashboard/grades' },
        ],
      },
    ],
  },
  {
    key: 'extensiones',
    label: 'Extensiones',
    title: 'Extensiones',
    sections: [
      {
        title: 'Extensiones',
        titleColor: 'navy',
        links: [
          { label: 'Instalar complementos' },
          { label: 'Vista general de extensiones' },
        ],
      },
      {
        title: 'Autenticación',
        titleColor: 'amber',
        links: [
          { label: 'Gestionar la autenticación' },
          { label: 'Cuentas manuales' },
          { label: 'Identificación basada en Email' },
        ],
      },
      {
        title: 'Banco de contenido',
        titleColor: 'amber',
        links: [{ label: 'Administrar tipos de contenido' }],
      },
      {
        title: 'Bloques',
        titleColor: 'amber',
        links: [
          { label: 'Gestionar bloques' },
          { label: 'Cursos' },
          { label: 'Cursos a los que se ha accedido recientemente' },
          { label: 'Cursos destacados' },
          { label: 'Enlaces de sección' },
          { label: 'Resultados de la actividad' },
          { label: 'Revisión de la accesibilidad' },
          { label: 'Texto' },
          { label: 'Usuarios en línea' },
          { label: 'Vista general de curso' },
        ],
      },
      {
        title: 'Buscar',
        titleColor: 'amber',
        links: [
          { label: 'Administrar búsqueda global' },
          { label: 'Áreas de búsqueda' },
          { label: 'Solr' },
        ],
      },
      {
        title: 'Caché',
        titleColor: 'amber',
        links: [
          { label: 'Configuración' },
          { label: 'Desempeño de prueba' },
          { label: 'Uso de caché' },
          { label: 'Almacenes de caché' },
          { label: 'Caché de usuario de APC (APCu)' },
          { label: 'Redis' },
        ],
      },
      {
        title: 'Campos personalizados',
        titleColor: 'amber',
        links: [{ label: 'Administrar tipos de campos personalizados' }],
      },
      {
        title: 'Complementos del banco de preguntas',
        titleColor: 'amber',
        links: [
          { label: 'Administrar los complementos del banco de preguntas' },
          { label: 'Ordenamiento de columnas' },
          { label: 'Campos personalizados de preguntas' },
        ],
      },
      {
        title: 'Comportamientos de las preguntas',
        titleColor: 'amber',
        links: [{ label: 'Gestionar comportamientos de preguntas.' }],
      },
      {
        title: 'Configuración del backend de aprendizaje automático',
        titleColor: 'amber',
        links: [{ label: 'Backend de aprendizaje automático de Python' }],
      },
      {
        title: 'Convertidores de documentos',
        titleColor: 'amber',
        links: [{ label: 'Gestionar convertidores de documentos' }],
      },
      {
        title: 'Editores de texto',
        titleColor: 'amber',
        links: [
          { label: 'Gestionar editores' },
          { label: 'Editor HTML Atto' },
          { label: 'Opciones de la barra herramienta de Atto' },
          { label: 'Colapsar opciones de configuración de la barra de herramientas' },
          { label: 'Opciones del editor de ecuaciones' },
          { label: 'RecordRTC (GrabarRTC)' },
          { label: 'Opciones de tabla' },
          { label: 'Editor TinyMCE' },
          { label: 'Ajustes generales' },
          { label: 'Configuracines del editor de ecuación' },
          { label: 'Lambda Content Editor Plugin' },
          { label: 'TinyMCE Premium' },
          { label: 'RecordRTC' },
        ],
      },
      {
        title: 'Extensiones locales',
        titleColor: 'amber',
        links: [{ label: 'Gestionar extensiones locales' }],
      },
    ],
  },
  {
    key: 'apariencia',
    label: 'Apariencia',
    title: 'Apariencia',
    sections: [
      {
        title: 'Temas',
        titleColor: 'navy',
        links: [
          { label: 'Selector de temas' },
          { label: 'Ajustes de tema' },
          { label: 'Tema Cognos Virtual (Predeterminado)' },
          { label: 'Modo Oscuro / Modo Claro' },
        ],
      },
      {
        title: 'Logos e Identidad',
        titleColor: 'amber',
        links: [
          { label: 'Logotipo principal del sitio' },
          { label: 'Logotipo compacto / Negativo' },
          { label: 'Favicon del sitio' },
        ],
      },
      {
        title: 'Navegación',
        titleColor: 'amber',
        links: [
          { label: 'Ajustes de la barra de navegación' },
          { label: 'Elementos del menú principal' },
          { label: 'Página de inicio del sitio' },
        ],
      },
      {
        title: 'HTML adicional',
        titleColor: 'amber',
        links: [
          { label: 'Dentro de HEAD' },
          { label: 'Al inicio de BODY' },
          { label: 'Al pie de página' },
        ],
      },
    ],
  },
  {
    key: 'servidor',
    label: 'Servidor',
    title: 'Servidor',
    sections: [
      {
        title: 'Servicios web y API',
        titleColor: 'navy',
        links: [
          { label: 'Tokens de acceso externos (API REST)', href: '/dashboard/settings/tokens' },
          { label: 'Protocolos activos (REST / JSON)', href: '/dashboard/settings/tokens' },
          { label: 'Gestionar servicios externos' },
        ],
      },
      {
        title: 'Tareas del Sistema',
        titleColor: 'amber',
        links: [
          { label: 'Tareas programadas (Cron)' },
          { label: 'Ejecución en segundo plano' },
        ],
      },
      {
        title: 'Entorno y Rendimiento',
        titleColor: 'amber',
        links: [
          { label: 'Información del entorno' },
          { label: 'Versión del sistema y librerías' },
          { label: 'Rendimiento y caché de consultas' },
        ],
      },
      {
        title: 'Limpieza y Mantenimiento',
        titleColor: 'amber',
        links: [
          { label: 'Limpieza de base de datos' },
          { label: 'Purgar todas las cachés' },
        ],
      },
    ],
  },
  {
    key: 'informes',
    label: 'Informes',
    title: 'Informes',
    sections: [
      {
        title: 'Generador de Informes',
        titleColor: 'navy',
        links: [
          { label: 'Generador de reportes personalizados', href: '/dashboard/reports/builder' },
          { label: 'Plantillas de exportación CSV / Excel', href: '/dashboard/reports/builder' },
        ],
      },
      {
        title: 'Portal Corporativo B2B y Sedes',
        titleColor: 'amber',
        links: [
          { label: 'Monitoreo por sucursales y franquicias', href: '/dashboard/reports/corporate' },
          { label: 'Métricas de empresas clientes', href: '/dashboard/reports/corporate' },
        ],
      },
      {
        title: 'Registros y Auditoría',
        titleColor: 'amber',
        links: [
          { label: 'Registro de auditoría (Audit Log)', href: '/admin/audit-log' },
          { label: 'Registros activos de usuarios' },
          { label: 'Informe de actividad en vivo' },
        ],
      },
    ],
  },
  {
    key: 'desarrollo',
    label: 'Desarrollo',
    title: 'Desarrollo',
    sections: [
      {
        title: 'Depuración',
        titleColor: 'navy',
        links: [
          { label: 'Mensajes de depuración' },
          { label: 'Información de rendimiento' },
          { label: 'Registro de errores' },
        ],
      },
      {
        title: 'Herramientas de API',
        titleColor: 'amber',
        links: [
          { label: 'Simulador de llamadas REST', href: '/dashboard/settings/tokens' },
          { label: 'Esquemas OpenAPI / Swagger' },
        ],
      },
      {
        title: 'Pruebas e Integración',
        titleColor: 'amber',
        links: [
          { label: 'Simulación E2E de cursos' },
          { label: 'Prueba de envío de correos y webhooks' },
        ],
      },
    ],
  },
];

export function SiteAdministrationView({ initialTab = 'cursos' }: { initialTab?: AdminTabKey }) {
  const [activeTabKey, setActiveTabKey] = useState<AdminTabKey>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalInfo, setModalInfo] = useState<string | null>(null);

  const activeTab = useMemo(() => {
    return TABS_DATA.find((t) => t.key === activeTabKey) ?? TABS_DATA[2]; // Default to Cursos
  }, [activeTabKey]);

  // Búsqueda en todos los módulos cuando hay texto en searchQuery
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const results: Array<{
      tabLabel: string;
      tabKey: AdminTabKey;
      sectionTitle: string;
      link: AdminLink;
    }> = [];

    TABS_DATA.forEach((tab) => {
      tab.sections.forEach((sec) => {
        sec.links.forEach((link) => {
          if (
            link.label.toLowerCase().includes(q) ||
            sec.title.toLowerCase().includes(q) ||
            tab.label.toLowerCase().includes(q)
          ) {
            results.push({
              tabLabel: tab.label,
              tabKey: tab.key,
              sectionTitle: sec.title,
              link,
            });
          }
        });
      });
    });

    return results;
  }, [searchQuery]);

  const handleNonLinkClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    setModalInfo(label);
  };

  return (
    <div className="space-y-6 font-poppins text-[#212529] dark:text-slate-200">
      {/* Buscador Superior */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <h1 className="text-xl sm:text-2xl font-bold text-[#00155C] dark:text-white">
          Administración del sitio
        </h1>

        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar ajuste o enlace..."
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101D31] px-3 py-1.5 pr-8 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-[#026BCA] focus:outline-none"
          />
          <span className="absolute right-2.5 top-2 text-slate-400">
            <SearchIcon size={14} />
          </span>
        </div>
      </div>

      {/* Barra de Pestañas Moodle Clásica */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none">
        <nav className="flex items-center space-x-1 sm:space-x-3 text-xs sm:text-[13px]">
          {TABS_DATA.map((tab) => {
            const isActive = activeTabKey === tab.key && !searchQuery;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTabKey(tab.key);
                  setSearchQuery('');
                }}
                className={`relative px-2.5 sm:px-3 py-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'font-bold text-[#00155C] dark:text-white border-b-2 border-[#00155C] dark:border-[#00BCE4]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#00155C] dark:hover:text-white font-normal'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenido Principal de la Pestaña */}
      <div className="bg-white dark:bg-[#101D31] border border-slate-200 dark:border-slate-800 rounded-xs p-6 sm:p-8 min-h-[420px]">
        {/* Vista si hay Búsqueda Activa */}
        {searchResults ? (
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#00155C] dark:text-white">
                Resultados de búsqueda ({searchResults.length})
              </h2>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#D27C00] dark:text-amber-400 hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>

            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-500 py-6">
                No se encontraron opciones que coincidan con &quot;{searchQuery}&quot;.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((res, idx) => (
                  <div key={idx} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      {res.link.href ? (
                        <Link
                          href={res.link.href}
                          className="text-xs sm:text-[13px] font-semibold text-[#D27C00] dark:text-amber-400 hover:underline"
                        >
                          {res.link.label}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleNonLinkClick(e, res.link.label)}
                          className="text-xs sm:text-[13px] font-semibold text-[#D27C00] dark:text-amber-400 hover:underline text-left"
                        >
                          {res.link.label}
                        </button>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {res.tabLabel} &gt; {res.sectionTitle}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Vista Normal por Pestaña */
          <div>
            {/* Título Principal de la Pestaña en Azul Marino */}
            <h2 className="text-xl sm:text-2xl font-bold text-[#00155C] dark:text-white mb-6">
              {activeTab.title}
            </h2>

            {/* Listado de Secciones con Columnas Moodle */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {activeTab.sections.map((section, idx) => {
                const isNavyTitle = section.titleColor === 'navy';
                return (
                  <div
                    key={section.title + idx}
                    className="py-5 sm:py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start"
                  >
                    {/* Columna Izquierda: Título de Sección */}
                    <div className="w-full md:w-1/3 lg:w-1/4 pr-4 mb-3 md:mb-0">
                      <h3
                        className={`text-base sm:text-lg font-bold ${
                          isNavyTitle
                            ? 'text-[#00155C] dark:text-white'
                            : 'text-[#D27C00] dark:text-amber-400'
                        }`}
                      >
                        {section.title}
                      </h3>
                    </div>

                    {/* Columna Derecha: Enlaces color Ámbar/Mostaza Moodle */}
                    <div className="w-full md:w-2/3 lg:w-3/4 space-y-1.5">
                      {section.links.map((link, lIdx) => {
                        if (link.href) {
                          return (
                            <div key={link.label + lIdx}>
                              <Link
                                href={link.href}
                                className="inline-block text-xs sm:text-[13px] text-[#D27C00] dark:text-amber-400 hover:text-[#A86200] dark:hover:text-amber-300 hover:underline transition-colors leading-relaxed"
                              >
                                {link.label}
                              </Link>
                            </div>
                          );
                        }

                        return (
                          <div key={link.label + lIdx}>
                            <button
                              type="button"
                              onClick={(e) => handleNonLinkClick(e, link.label)}
                              className="text-left text-xs sm:text-[13px] text-[#D27C00] dark:text-amber-400 hover:text-[#A86200] dark:hover:text-amber-300 hover:underline transition-colors leading-relaxed"
                            >
                              {link.label}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal Informativo para Ajustes con Valor por Defecto Activo */}
      {modalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#101D31] border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 font-poppins">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                  <CheckCircleIcon size={18} />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#00155C] dark:text-white">
                    {modalInfo}
                  </h4>
                  <span className="text-[11px] text-slate-500">Configuración del sitio</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalInfo(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <XIcon size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              El parámetro <strong>&quot;{modalInfo}&quot;</strong> se encuentra activo con la configuración óptima predeterminada del entorno Cognos LMS. Puedes modificar este valor directamente en{' '}
              <Link
                href="/admin/settings"
                onClick={() => setModalInfo(null)}
                className="text-[#026BCA] dark:text-[#00BCE4] font-bold hover:underline"
              >
                Configuración general del sitio
              </Link>.
            </p>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setModalInfo(null)}
                className="rounded-lg bg-[#00155C] px-4 py-2 text-xs font-bold text-white hover:bg-[#026BCA] transition"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
