import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  formatDimensions,
  getLocaleAlternates,
  getLocaleFromUrl,
  localizePath,
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
    expect(t('es', 'artwork.alt', { title: 'Monolito', medium: 'Pluma bic' })).toBe(
      'Monolito, Pluma bic, por Eduardo Pavón',
    );
  });

  it('leaves unknown placeholders untouched rather than printing undefined', () => {
    expect(t('es', 'artwork.alt', { title: 'Monolito' })).toContain('{medium}');
  });
});

describe('localizePath', () => {
  it('leaves the default locale unprefixed', () => {
    expect(localizePath('/', DEFAULT_LOCALE)).toBe('/');
    expect(localizePath('/obra', DEFAULT_LOCALE)).toBe('/obra');
  });

  it('prefixes a non-default locale', () => {
    expect(localizePath('/', 'en')).toBe('/en/');
    expect(localizePath('/obra', 'en')).toBe('/en/obra');
  });

  it('normalizes surrounding slashes', () => {
    expect(localizePath('obra/', DEFAULT_LOCALE)).toBe('/obra');
  });
});

describe('getLocaleFromUrl', () => {
  it('reads the default locale from an unprefixed path', () => {
    expect(getLocaleFromUrl(new URL('/', SITE))).toBe('es');
    expect(getLocaleFromUrl(new URL('/obra/monolito', SITE))).toBe('es');
  });

  it('does not mistake a normal path segment for a locale', () => {
    expect(getLocaleFromUrl(new URL('/sobre', SITE))).toBe('es');
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
});

describe('formatDimensions', () => {
  it('always renders width before height', () => {
    expect(formatDimensions({ width: 37, height: 25.5, unit: 'cm' }, 'es')).toBe('37 × 25,5 cm');
  });

  it('localizes the decimal separator', () => {
    expect(formatDimensions({ width: 28.34, height: 31.3, unit: 'in' }, 'es')).toBe(
      '28,34 × 31,3 in',
    );
  });
});
