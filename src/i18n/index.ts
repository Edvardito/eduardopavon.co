import type { ArtworkStatus } from '~/site';
import es from './ui/es';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_METADATA,
  PREFIX_DEFAULT_LOCALE,
  isLocale,
  type Locale,
} from './config';

export { DEFAULT_LOCALE, LOCALES, LOCALE_METADATA, PREFIX_DEFAULT_LOCALE, isLocale, type Locale };

export type UiMessages = typeof es;
export type MessageKey = keyof UiMessages;

const MESSAGES: Record<Locale, UiMessages> = { es };

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
  return t(locale, status === 'sold' ? 'status.sold' : 'status.framed');
}

/** Marks where an inline element belongs inside a translated sentence. */
export const SLOT = '<<slot>>';

/**
 * Split a translated sentence around {@link SLOT} so a link can be spliced in
 * while each language keeps its own word order. Throws rather than silently
 * truncating the sentence when a translation drops the placeholder.
 */
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

export function getLocaleFromUrl(url: URL): Locale {
  const [, first] = url.pathname.split('/');
  return first && isLocale(first) ? first : DEFAULT_LOCALE;
}

export function localizePath(path: string, locale: string): string {
  const normalized = `/${path.replace(/^\/+|\/+$/g, '')}`;
  if (locale === DEFAULT_LOCALE && !PREFIX_DEFAULT_LOCALE) return normalized;
  return normalized === '/' ? `/${locale}/` : `/${locale}${normalized}`;
}

export function getLocaleAlternates(
  path: string,
  site: URL,
): Array<{ hreflang: string; href: string }> {
  const alternates = LOCALES.map((locale) => ({
    hreflang: LOCALE_METADATA[locale].htmlLang,
    href: new URL(localizePath(path, locale), site).href,
  }));
  alternates.push({
    hreflang: 'x-default',
    href: new URL(localizePath(path, DEFAULT_LOCALE), site).href,
  });
  return alternates;
}
