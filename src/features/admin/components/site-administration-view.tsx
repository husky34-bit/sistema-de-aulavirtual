'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SearchIcon, CheckCircleIcon, XIcon, UploadIcon } from '@/components/Icons';
import { BulkImportModal } from '@/features/users/components/bulk-import-modal';

export type AdminTabKey =
  | 'usuarios'
  | 'cursos'
  | 'calificaciones'
  | 'informes'
  | 'sistema';

interface AdminLink {
  label: string;
  href?: string;
  badge?: string;
  action?: 'bulk-import' | 'info';
  description?: string;
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
  subtitle: string;
  sections: AdminSection[];
}

const MODERN_TABS: TabData[] = [
  {
    key: 'usuarios',
    label: 'Usuarios y Matrículas',
    title: 'Gestión de Usuarios y Matrículas',
    subtitle: 'Administración de cuentas, asignación de roles, cohortes institucionales y alta masiva.',
    sections: [
      {
        title: 'Cuentas y Accesos',
        titleColor: 'amber',
        links: [
          {
            label: 'Examinar lista de usuarios',
            href: '/users',
            description: 'Directorio completo con buscador, roles y estado de acceso.',
          },
          {
            label: 'Crear un nuevo usuario',
            href: '/users',
            description: 'Formulario de registro individual de estudiante o docente.',
          },
          {
            label: 'Subir usuarios masivamente (CSV)',
            action: 'bulk-import',
            badge: 'Herramienta Activa',
            description: 'Carga masiva mediante archivo CSV o copia de datos.',
          },
          {
            label: 'Gestión de roles y permisos (Admin, Docente, Estudiante)',
            href: '/users',
            description: 'Asignación de privilegios de acceso institucional.',
          },
        ],
      },
      {
        title: 'Grupos y Cohortes',
        titleColor: 'amber',
        links: [
          {
            label: 'Administración de Cohortes',
            href: '/admin/cohorts',
            description: 'Agrupamiento de alumnos por empresa, sede o promoción.',
          },
          {
            label: 'Sincronización masiva de cohortes a cursos',
            href: '/admin/cohorts',
            description: 'Matriculación de grupos enteros en materias con un solo clic.',
          },
        ],
      },
      {
        title: 'Políticas de Seguridad y Privacidad',
        titleColor: 'amber',
        links: [
          {
            label: 'Políticas de contraseñas y sesiones activas',
            href: '/admin/settings',
            description: 'Requisitos de seguridad y tiempo de expiración.',
          },
          {
            label: 'Opciones de privacidad y retención de datos',
            action: 'info',
            description: 'Políticas institucionales de custodia de información académica.',
          },
        ],
      },
    ],
  },
  {
    key: 'cursos',
    label: 'Cursos y Programas',
    title: 'Administración de Cursos y Programas',
    subtitle: 'Creación oficial de asignaturas, asignación de docentes, categorías y módulos.',
    sections: [
      {
        title: 'Gestión Académica',
        titleColor: 'navy',
        links: [
          {
            label: '+ Crear un nuevo curso oficial',
            href: '/dashboard/courses/new',
            badge: 'Solo Administrador',
            description: 'Alta de curso con docente asignado, portada 280x280 y slug.',
          },
          {
            label: 'Catálogo y administración de cursos',
            href: '/dashboard/courses',
            description: 'Gestión de contenidos, secciones, cuestionarios y foros.',
          },
          {
            label: 'Categorías y áreas de estudio (Ciberseguridad, Redes, Cloud, IA)',
            href: '/dashboard/courses',
            description: 'Organización temática del catálogo formativo.',
          },
        ],
      },
      {
        title: 'Configuración de Contenidos',
        titleColor: 'amber',
        links: [
          {
            label: 'Criterios de finalización y seguimiento de módulos',
            action: 'info',
            description: 'Reglas de avance y desbloqueo progresivo de lecciones.',
          },
          {
            label: 'Banco de preguntas institucional',
            href: '/dashboard/courses',
            description: 'Preguntas de opción múltiple, verdadero/falso y emparejamiento.',
          },
        ],
      },
      {
        title: 'Respaldo y Duplicación',
        titleColor: 'amber',
        links: [
          {
            label: 'Copias de seguridad de cursos y contenidos',
            action: 'info',
            description: 'Respaldos automáticos de estructura y evaluaciones en base de datos.',
          },
        ],
      },
    ],
  },
  {
    key: 'calificaciones',
    label: 'Calificaciones y Actas',
    title: 'Centro de Calificaciones y Actas',
    subtitle: 'Supervisión de notas, libro del calificador y generación de actas de aprobación.',
    sections: [
      {
        title: 'Libro de Calificaciones',
        titleColor: 'navy',
        links: [
          {
            label: 'Informe del calificador global',
            href: '/dashboard/grades',
            badge: 'Matriz en Vivo',
            description: 'Notas consolidadas de cuestionarios, laboratorios y tareas.',
          },
          {
            label: 'Exportar actas oficiales de notas (CSV / Excel)',
            href: '/dashboard/grades',
            description: 'Descarga directa de actas académicas para archivo o firma.',
          },
        ],
      },
      {
        title: 'Criterios de Aprobación',
        titleColor: 'amber',
        links: [
          {
            label: 'Escala de evaluación y nota mínima de aprobación (51 / 100)',
            action: 'info',
            description: 'Puntajes de corte para aprobación de materias y certificados.',
          },
          {
            label: 'Acreditación y certificados automáticos',
            action: 'info',
            description: 'Emisión de certificados digitales con código QR de verificación.',
          },
        ],
      },
    ],
  },
  {
    key: 'informes',
    label: 'Informes & Portal B2B',
    title: 'Informes Institucionales y Portal B2B',
    subtitle: 'Métricas de rendimiento, portal corporativo para empresas clientes y sucursales.',
    sections: [
      {
        title: 'Analítica Académica',
        titleColor: 'navy',
        links: [
          {
            label: 'Generador de reportes personalizados',
            href: '/dashboard/reports/builder',
            description: 'Reportes tabulares con filtros por cursos, fechas y estados.',
          },
          {
            label: 'Plantillas de exportación de datos',
            href: '/dashboard/reports/builder',
            description: 'Descargas en formato CSV compatible con Excel y PowerBI.',
          },
        ],
      },
      {
        title: 'Clientes Corporativos y Sedes',
        titleColor: 'amber',
        links: [
          {
            label: 'Portal Corporativo B2B y Sedes Regionales',
            href: '/dashboard/reports/corporate',
            badge: 'Multi-sede',
            description: 'Monitoreo de capacitación para empresas y franquicias asociadas.',
          },
          {
            label: 'Reporte de asistencia y participación en clases en vivo',
            href: '/dashboard/reports/builder',
            description: 'Registro de asistencia a sesiones de Zoom y actividades.',
          },
        ],
      },
    ],
  },
  {
    key: 'sistema',
    label: 'Sistema, API y Seguridad',
    title: 'Configuración del Sistema, API y Seguridad',
    subtitle: 'Control de accesos externos, auditoría de eventos y ajustes globales de marca.',
    sections: [
      {
        title: 'Integraciones y API',
        titleColor: 'navy',
        links: [
          {
            label: 'Tokens de integración externa (API REST v1)',
            href: '/dashboard/settings/tokens',
            description: 'Claves seguras para conectar CRMs, sistemas de cobro y ERPs.',
          },
          {
            label: 'Documentación de endpoints de la API REST',
            href: '/dashboard/settings/tokens',
            description: 'Especificación de endpoints para sincronización de alumnos y notas.',
          },
        ],
      },
      {
        title: 'Auditoría y Seguridad',
        titleColor: 'amber',
        links: [
          {
            label: 'Registro de Auditoría (Audit Log)',
            href: '/admin/audit-log',
            badge: 'Trazabilidad',
            description: 'Historial detallado de eventos, cambios de notas y accesos.',
          },
          {
            label: 'Configuración general de la plataforma',
            href: '/admin/settings',
            description: 'Parámetros del sitio, nombre de la institución y variables.',
          },
        ],
      },
      {
        title: 'Estado de la Plataforma',
        titleColor: 'amber',
        links: [
          {
            label: 'Base de datos PostgreSQL & Prisma ORM',
            action: 'info',
            description: 'Conexión segura y optimizada con pooling de conexiones.',
          },
          {
            label: 'ZenviaLMS v2.5 · Cognos Capacitación',
            action: 'info',
            description: 'Arquitectura moderna sobre Next.js 15, React 19 y TypeScript.',
          },
        ],
      },
    ],
  },
];

export function SiteAdministrationView({
  initialTab = 'usuarios',
  courses = [],
}: {
  initialTab?: AdminTabKey;
  courses?: Array<{ id: string; title: string }>;
}) {
  const [activeTabKey, setActiveTabKey] = useState<AdminTabKey>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalInfo, setModalInfo] = useState<string | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  const activeTab = useMemo(() => {
    return MODERN_TABS.find((t) => t.key === activeTabKey) ?? MODERN_TABS[0];
  }, [activeTabKey]);

  // Búsqueda en tiempo real entre todas las opciones
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const results: Array<{
      tabLabel: string;
      tabKey: AdminTabKey;
      sectionTitle: string;
      link: AdminLink;
    }> = [];

    MODERN_TABS.forEach((tab) => {
      tab.sections.forEach((sec) => {
        sec.links.forEach((link) => {
          if (
            link.label.toLowerCase().includes(q) ||
            (link.description && link.description.toLowerCase().includes(q)) ||
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

  const handleLinkClick = (e: React.MouseEvent, link: AdminLink) => {
    if (link.action === 'bulk-import') {
      e.preventDefault();
      setIsBulkImportOpen(true);
      return;
    }

    if (link.action === 'info' || !link.href) {
      e.preventDefault();
      setModalInfo(link.label);
    }
  };

  return (
    <div className="space-y-6 font-poppins text-[#212529] dark:text-slate-200">
      {/* Encabezado y Buscador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#00155C] dark:text-white">
            Administración del sitio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Panel centralizado con las herramientas operativas esenciales para la administración de Cognos LMS.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar herramienta o módulo..."
            className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#101D31] px-3.5 py-2 pr-9 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:border-[#026BCA] focus:outline-none"
          />
          <span className="absolute right-3 top-2.5 text-slate-400">
            <SearchIcon size={14} />
          </span>
        </div>
      </div>

      {/* Barra de 5 Pestañas Esenciales (Estilo Moodle Oficial) */}
      <div className="border-b border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none">
        <nav className="flex items-center space-x-2 sm:space-x-4 text-xs sm:text-[13.5px]">
          {MODERN_TABS.map((tab) => {
            const isActive = activeTabKey === tab.key && !searchQuery;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTabKey(tab.key);
                  setSearchQuery('');
                }}
                className={`relative px-3 py-2.5 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'font-bold text-[#00155C] dark:text-white border-b-[3px] border-[#00155C] dark:border-[#00BCE4]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-[#00155C] dark:hover:text-white font-medium'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Contenedor de Opciones */}
      <div className="bg-white dark:bg-[#101D31] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 min-h-[400px]">
        {/* Resultados de Búsqueda */}
        {searchResults ? (
          <div>
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-[#00155C] dark:text-white">
                Opciones encontradas ({searchResults.length})
              </h2>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-[#D27C00] dark:text-amber-400 hover:underline font-semibold"
              >
                Limpiar búsqueda
              </button>
            </div>

            {searchResults.length === 0 ? (
              <p className="text-xs text-slate-500 py-6">
                No se encontraron opciones para &quot;{searchQuery}&quot;.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {searchResults.map((res, idx) => (
                  <div
                    key={idx}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      {res.link.href ? (
                        <Link
                          href={res.link.href}
                          className="text-xs sm:text-[13.5px] font-bold text-[#D27C00] dark:text-amber-400 hover:underline"
                        >
                          {res.link.label}
                        </Link>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => handleLinkClick(e, res.link)}
                          className="text-xs sm:text-[13.5px] font-bold text-[#D27C00] dark:text-amber-400 hover:underline text-left"
                        >
                          {res.link.label}
                        </button>
                      )}
                      {res.link.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {res.link.description}
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] font-medium text-slate-400 shrink-0">
                      {res.tabLabel} &gt; {res.sectionTitle}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Vista Normal de la Pestaña Activa */
          <div>
            {/* Título y Subtítulo de la Pestaña */}
            <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#00155C] dark:text-white">
                {activeTab.title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeTab.subtitle}
              </p>
            </div>

            {/* Columnas Estilo Moodle */}
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {activeTab.sections.map((section, idx) => {
                const isNavy = section.titleColor === 'navy';
                return (
                  <div
                    key={section.title + idx}
                    className="py-5 sm:py-6 first:pt-0 last:pb-0 flex flex-col md:flex-row items-start"
                  >
                    {/* Columna Izquierda: Título de Sección */}
                    <div className="w-full md:w-1/3 lg:w-1/4 pr-4 mb-3 md:mb-0">
                      <h3
                        className={`text-base sm:text-lg font-bold ${
                          isNavy
                            ? 'text-[#00155C] dark:text-white'
                            : 'text-[#D27C00] dark:text-amber-400'
                        }`}
                      >
                        {section.title}
                      </h3>
                    </div>

                    {/* Columna Derecha: Enlaces y Acciones */}
                    <div className="w-full md:w-2/3 lg:w-3/4 space-y-3">
                      {section.links.map((link, lIdx) => {
                        const content = (
                          <div className="group">
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-[13.5px] font-medium text-[#D27C00] dark:text-amber-400 group-hover:underline leading-relaxed">
                                {link.label}
                              </span>
                              {link.badge && (
                                <span className="inline-flex rounded-full bg-blue-50 dark:bg-blue-950 px-2 py-0.5 text-[10px] font-bold text-[#026BCA] dark:text-[#00BCE4] border border-blue-200 dark:border-blue-900">
                                  {link.badge}
                                </span>
                              )}
                            </div>
                            {link.description && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {link.description}
                              </p>
                            )}
                          </div>
                        );

                        if (link.href && link.action !== 'bulk-import') {
                          return (
                            <div key={link.label + lIdx}>
                              <Link href={link.href}>{content}</Link>
                            </div>
                          );
                        }

                        return (
                          <div key={link.label + lIdx}>
                            <button
                              type="button"
                              onClick={(e) => handleLinkClick(e, link)}
                              className="text-left w-full cursor-pointer"
                            >
                              {content}
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

      {/* Modal de Importación Masiva de Estudiantes (CSV) */}
      <BulkImportModal
        isOpen={isBulkImportOpen}
        onClose={() => setIsBulkImportOpen(false)}
        courses={courses}
      />

      {/* Modal Informativo para Ajustes Activos */}
      {modalInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 font-poppins">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#101D31] border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950 text-[#026BCA] dark:text-[#00BCE4]">
                  <CheckCircleIcon size={18} />
                </span>
                <div>
                  <h4 className="text-sm font-bold text-[#00155C] dark:text-white">
                    {modalInfo}
                  </h4>
                  <span className="text-[11px] text-slate-500">Parámetro Activo</span>
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
              El módulo <strong>&quot;{modalInfo}&quot;</strong> se encuentra operando bajo las configuraciones predeterminadas de alto rendimiento de Cognos LMS. Puedes ajustar las variables maestras en:{' '}
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
