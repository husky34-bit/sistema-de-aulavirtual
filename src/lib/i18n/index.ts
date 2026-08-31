import { es, type TranslationKey } from './es';
import { en } from './en';

export type Language = 'es' | 'en';

export function t(key: TranslationKey, lang: Language = 'es'): string {
  const dict = lang === 'en' ? en : es;
  return dict[key] ?? es[key] ?? key;
}

export { es, en };
export type { TranslationKey };
