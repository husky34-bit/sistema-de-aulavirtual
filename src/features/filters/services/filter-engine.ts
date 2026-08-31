// Motor de filtros: pipeline de transformación de contenido HTML.
// Pasa el HTML crudo por sanitize() para devolver HTML seguro.

import { sanitizeHtml } from './sanitize';

/**
 * Procesa el contenido HTML a través del pipeline de filtros.
 * Actualmente solo sanitiza, pero está estructurado para añadir
 * más etapas en el futuro (macros, multiidioma, etc.).
 */
export function renderContent(html: string): string {
  return sanitizeHtml(html);
}
