import type { ArtworkStatus } from '~/site';
import en from './ui/en';
import es from './ui/es';
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALES,
  LOCALE_METADATA,
  PREFIX_DEFAULT_LOCALE,
  type Locale,
} from './config';

export * from './config';
export { negotiateLocale } from './negotiate';

/* Values widen to string: one locale's wording cannot satisfy another's literals. */
export type UiMessages = { [K in keyof typeof es]: string };
export type MessageKey = keyof UiMessages;

const MESSAGES: Record<Locale, UiMessages> = { es, en };

export type Localized<T> = Record<string, T>;

export function resolveLocalized<T>(value: Localized<T>, locale: string): T {
  return value[locale] ?? (value[DEFAULT_LOCALE] as T);
}

function interpolate(message: string, params?: Record<string, string | number>): string {
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

export function t(
  locale: Locale,
  key: MessageKey,
  params?: Record<string, string | number>,
): string {
  const message = MESSAGES[locale]?.[key] ?? MESSAGES[DEFAULT_LOCALE][key];
  return interpolate(message, params);
}

export function statusLabel(status: ArtworkStatus, locale: Locale): string {
  return t(locale, `status.${status}`);
}

/** Marks where an inline element belongs inside a translated sentence. */
export const SLOT = '<<slot>>';

/** Splits around {@link SLOT} so a link or a set-apart word keeps each language's word order. Throws if absent. */
export function splitAroundSlot(message: string): [before: string, after: string] {
  const parts = message.split(SLOT);
  if (parts.length !== 2) {
    throw new Error(`Expected exactly one ${SLOT} in translated message: "${message}"`);
  }
  return [parts[0]!, parts[1]!];
}

export function useTranslations(locale: Locale) {
  return (key: MessageKey, params?: Record<string, string | number>) => t(locale, key, params);
}

export interface Dimensions {
  width: number;
  height: number;
  unit: 'cm' | 'in';
}

/** Always width × height. Numbers are localized (Spanish uses a decimal comma). */
export function formatDimensions(dimensions: Dimensions, locale: Locale): string {
  const format = new Intl.NumberFormat(LOCALE_METADATA[locale].htmlLang, {
    maximumFractionDigits: 2,
  });
  return `${format.format(dimensions.width)} × ${format.format(dimensions.height)} ${dimensions.unit}`;
}

/* Always slashed, matching `trailingSlash: 'always'`; an unslashed URL is a redirect. */
export function localizePath(path: string, locale: string): string {
  const trimmed = path.replace(/^\/+|\/+$/g, '');
  const prefixed = locale === DEFAULT_LOCALE && !PREFIX_DEFAULT_LOCALE ? [] : [locale];
  const segments = [...prefixed, ...(trimmed ? [trimmed] : [])];
  return segments.length ? `/${segments.join('/')}/` : '/';
}

/** One crawlable link per edition, each labelled in its own language. */
export function getLanguageLinks(
  path: string,
): Array<{ locale: Locale; href: string; hreflang: string; label: string }> {
  return LOCALES.map((locale) => ({
    locale,
    href: localizePath(path, locale),
    hreflang: LOCALE_METADATA[locale].htmlLang,
    label: LOCALE_METADATA[locale].label,
  }));
}

export function getLocaleAlternates(
  path: string,
  site: URL,
): Array<{ hreflang: string; href: string }> {
  const alternates = getLanguageLinks(path).map(({ hreflang, href }) => ({
    hreflang,
    href: new URL(href, site).href,
  }));
  alternates.push({
    hreflang: 'x-default',
    href: new URL(localizePath(path, FALLBACK_LOCALE), site).href,
  });
  return alternates;
}
