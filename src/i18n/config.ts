export const LOCALES = ['es'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

// false keeps the launch language at `/` instead of `/es/`.
export const PREFIX_DEFAULT_LOCALE = false;

export const LOCALE_METADATA: Record<
  Locale,
  { htmlLang: string; ogLocale: string; label: string }
> = {
  es: { htmlLang: 'es', ogLocale: 'es_ES', label: 'Español' },
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
