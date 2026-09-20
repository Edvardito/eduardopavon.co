export const LOCALES = ['es', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

/** The authoring language: what content falls back to, not what a visitor gets. */
export const DEFAULT_LOCALE: Locale = 'es';

/** What a visitor gets when we do not publish their language; also x-default. */
export const FALLBACK_LOCALE: Locale = 'en';

// Every edition is prefixed, so `/` is free to negotiate. See src/pages/index.ts.
export const PREFIX_DEFAULT_LOCALE = true;

export const LOCALE_METADATA: Record<
  Locale,
  { htmlLang: string; ogLocale: string; label: string }
> = {
  es: { htmlLang: 'es', ogLocale: 'es_ES', label: 'Español' },
  en: { htmlLang: 'en', ogLocale: 'en_US', label: 'English' },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
