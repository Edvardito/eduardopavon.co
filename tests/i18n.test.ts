import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALES,
  formatDimensions,
  getLanguageLinks,
  getLocaleAlternates,
  localizePath,
  negotiateLocale,
  resolveLocalized,
  t,
} from '~/i18n';

const SITE = new URL('https://eduardopavon.co');

describe('resolveLocalized', () => {
  it('returns the requested locale when present', () => {
    expect(resolveLocalized({ es: 'Billete falso' }, 'es')).toBe('Billete falso');
  });

  it('falls back to the default locale when a translation is missing', () => {
    // Simulates a locale added to LOCALES before its content is translated.
    const partiallyTranslated = { es: 'Billete falso' } as Record<string, string>;
    expect(resolveLocalized(partiallyTranslated, 'en')).toBe('Billete falso');
  });
});

describe('t', () => {
  it('looks up a message', () => {
    expect(t('es', 'status.sold')).toBe('Vendida');
  });

  it('interpolates named placeholders', () => {
    expect(t('es', 'artwork.alt', { title: 'Monolito', medium: 'Pluma Bic' })).toBe(
      'Monolito, Pluma Bic, por Eduardo Pavón',
    );
  });

  it('leaves unknown placeholders untouched rather than printing undefined', () => {
    expect(t('es', 'artwork.alt', { title: 'Monolito' })).toContain('{medium}');
  });
});

describe('localizePath', () => {
  it('prefixes every locale, the authoring one included', () => {
    expect(localizePath('/', DEFAULT_LOCALE)).toBe('/es/');
    expect(localizePath('/obra', DEFAULT_LOCALE)).toBe('/es/obra/');
    expect(localizePath('/', 'en')).toBe('/en/');
    expect(localizePath('/obra', 'en')).toBe('/en/obra/');
  });

  it('normalizes surrounding slashes, and always ends on one', () => {
    expect(localizePath('obra', DEFAULT_LOCALE)).toBe('/es/obra/');
    expect(localizePath('//obra//', 'en')).toBe('/en/obra/');
    expect(localizePath('/obra/monolito', 'en')).toBe('/en/obra/monolito/');
  });
});

describe('getLanguageLinks', () => {
  it('links every edition of the same page, labelled in its own language', () => {
    const links = getLanguageLinks('/obra');
    expect(links.map((l) => l.locale)).toEqual([...LOCALES]);
    expect(links.map((l) => l.href)).toEqual(LOCALES.map((l) => localizePath('/obra', l)));
    expect(links.find((l) => l.locale === 'es')).toMatchObject({
      hreflang: 'es',
      label: 'Español',
    });
    expect(links.find((l) => l.locale === 'en')).toMatchObject({
      hreflang: 'en',
      label: 'English',
    });
  });
});

describe('negotiateLocale', () => {
  it('matches a regional tag on its primary subtag', () => {
    expect(negotiateLocale('es-MX,es;q=0.9')).toBe('es');
    expect(negotiateLocale('en-GB')).toBe('en');
    expect(negotiateLocale('es-419')).toBe('es');
  });

  it('honours q-values rather than header order', () => {
    expect(negotiateLocale('fr;q=1.0, es;q=0.8, en;q=0.9')).toBe('en');
    expect(negotiateLocale('de,es;q=0.7')).toBe('es');
  });

  it('ignores a language we do not publish', () => {
    expect(negotiateLocale('fr-FR,fr;q=0.9')).toBe(FALLBACK_LOCALE);
  });

  it('falls back when the header is absent, empty or a wildcard', () => {
    expect(negotiateLocale(null)).toBe(FALLBACK_LOCALE);
    expect(negotiateLocale('')).toBe(FALLBACK_LOCALE);
    expect(negotiateLocale('*')).toBe(FALLBACK_LOCALE);
  });

  it('skips a language explicitly refused with q=0', () => {
    expect(negotiateLocale('es;q=0, en;q=0.5')).toBe('en');
  });
});

describe('getLocaleAlternates', () => {
  it('emits absolute URLs and an x-default', () => {
    const alternates = getLocaleAlternates('/', SITE);
    expect(alternates.map((a) => a.hreflang)).toContain('x-default');
    for (const alternate of alternates) {
      expect(alternate.href.startsWith('https://eduardopavon.co')).toBe(true);
    }
  });

  it('lists every locale, and points x-default at the fallback', () => {
    const alternates = getLocaleAlternates('/', SITE);
    expect(alternates.map((a) => a.hreflang)).toEqual(['es', 'en', 'x-default']);
    expect(alternates.find((a) => a.hreflang === 'x-default')?.href).toBe(
      new URL(localizePath('/', FALLBACK_LOCALE), SITE).href,
    );
  });
});

describe('message files', () => {
  /* Types catch a missing key; only this catches one nobody else has. */
  it('define exactly the same keys in every locale', async () => {
    const files = await Promise.all(
      LOCALES.map(async (locale) => ({
        locale,
        keys: Object.keys((await import(`../src/i18n/ui/${locale}.ts`)).default).sort(),
      })),
    );
    const [first, ...rest] = files;
    for (const file of rest) {
      expect(file.keys, `${file.locale} drifted from ${first!.locale}`).toEqual(first!.keys);
    }
  });
});

describe('the English edition', () => {
  it('translates every UI string, so no key falls through to Spanish', () => {
    expect(t('en', 'gallery.heading')).toBe('Work');
    expect(t('en', 'status.sold')).toBe('Sold');
    expect(t('en', 'contact.heading')).toBe('Contact');
  });
});

describe('formatDimensions', () => {
  it('always renders width before height', () => {
    expect(formatDimensions({ width: 37, height: 25.5, unit: 'cm' }, 'es')).toBe('37 × 25,5 cm');
  });

  it('localizes the decimal separator per edition', () => {
    const dimensions = { width: 28.34, height: 31.3, unit: 'in' } as const;
    expect(formatDimensions(dimensions, 'es')).toBe('28,34 × 31,3 in');
    expect(formatDimensions(dimensions, 'en')).toBe('28.34 × 31.3 in');
  });
});
