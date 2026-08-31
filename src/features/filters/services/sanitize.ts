// Servicio de sanitización de HTML usando DOMPurify (isomorphic).
// Define las etiquetas, atributos e iframes permitidos.

import DOMPurify from 'isomorphic-dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div', 'iframe',
];

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'class', 'target', 'rel',
  'width', 'height', 'allowfullscreen',
];

// Solo se permiten iframes de YouTube y Vimeo
const ALLOWED_IFRAME_HOSTNAMES = [
  'youtube.com', 'www.youtube.com', 'youtu.be',
  'vimeo.com', 'player.vimeo.com', 'www.vimeo.com',
];

// Hook para restringir los hostnames de los iframes
DOMPurify.addHook('uponSanitizeElement', (node: unknown, data: { tagName: string }) => {
  if (data.tagName === 'iframe') {
    const el = node as Element;
    const src = el.getAttribute('src') ?? '';
    try {
      const hostname = new URL(src, 'https://example.com').hostname;
      if (!ALLOWED_IFRAME_HOSTNAMES.includes(hostname)) {
        el.parentNode?.removeChild(el);
      }
    } catch {
      el.parentNode?.removeChild(el);
    }
  }
});

/**
 * Sanitiza HTML de contenido eliminando scripts, eventos inline y
 * iframes de hostnames no permitidos.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  }) as string;
}
