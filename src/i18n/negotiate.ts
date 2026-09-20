import { FALLBACK_LOCALE, LOCALES, type Locale } from './config';

interface Preference {
  tag: string;
  quality: number;
}

function parseAcceptLanguage(header: string): Preference[] {
  return header
    .split(',')
    .map((part) => {
      const [tag = '', ...parameters] = part.trim().split(';');
      const q = parameters
        .map((parameter) => /^\s*q=([\d.]+)\s*$/.exec(parameter))
        .find((match) => match !== null);
      const quality = q ? Number.parseFloat(q[1]!) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isNaN(quality) ? 0 : quality };
    })
    .filter((preference) => preference.tag !== '' && preference.quality > 0)
    .sort((a, b) => b.quality - a.quality);
}

/**
 * Match on the primary subtag, so `es-MX` and `es-419` both reach Spanish. A
 * wildcard tells us nothing about the reader, so it falls through.
 */
export function negotiateLocale(header: string | null | undefined): Locale {
  if (!header) return FALLBACK_LOCALE;

  for (const { tag } of parseAcceptLanguage(header)) {
    const primary = tag.split('-')[0];
    const match = LOCALES.find((locale) => locale === primary);
    if (match) return match;
  }

  return FALLBACK_LOCALE;
}
