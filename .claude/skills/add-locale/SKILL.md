---
name: add-locale
description:
  Add a new language to eduardopavon.com, or work on its i18n seam — register
  the locale, create its UI message file, translate artwork fields, and verify
  routing, hreflang and html lang. Use when adding or removing a language,
  translating strings, or asked how localization, t(), or locale fallback works.
---

# Add a locale

The seam is built so a language is a **content** change. If you find yourself
editing a route, a component or the collection schema, stop — something is wrong
with the approach, not with the seam.

Worked example below adds English (`en`).

## 1. Register the locale

`src/i18n/config.ts` is the single edit point. `astro.config.ts` imports it, so
Astro's routing follows automatically.

```ts
export const LOCALES = ['es', 'en'] as const;

export const LOCALE_METADATA: Record<
  Locale,
  { htmlLang: string; ogLocale: string; label: string }
> = {
  es: { htmlLang: 'es', ogLocale: 'es_ES', label: 'Español' },
  en: { htmlLang: 'en', ogLocale: 'en_US', label: 'English' },
};
```

Leave `DEFAULT_LOCALE` as `es` and `PREFIX_DEFAULT_LOCALE` as `false`: Spanish
stays at `/`, the new language is served from `/en/`.

`label` is the endonym, for a future language switcher.

## 2. Create the UI message file

Copy `src/i18n/ui/es.ts` to `src/i18n/ui/en.ts` and translate the values. Keep
every key, keep `{placeholders}` intact.

Register it in `src/i18n/index.ts`:

```ts
import en from './ui/en';
import es from './ui/es';

const MESSAGES: Record<Locale, UiMessages> = { es, en };
```

`UiMessages` is derived from the Spanish file, so a missing or invented key is a
**type error**. `docker compose run --rm web pnpm check` is the proof the file
is complete.

## 3. Add the routes

Astro's i18n config handles prefixes, not page generation — each non-default
locale still needs its page files. Create `src/pages/en/` mirroring the root
pages:

```
src/pages/index.astro       ->  src/pages/en/index.astro
src/pages/404.astro         ->  src/pages/en/404.astro
```

The copies need **no changes**: each page calls `getLocaleFromUrl(Astro.url)`,
which reads the locale from the path.

Prefer re-exporting over duplicating, so the pages cannot drift:

```astro
---
// src/pages/en/index.astro
import Index from '../index.astro';
---

<Index />
```

## 4. Translate the artwork fields

Add the locale key to each entry in `src/content/artworks/*.yaml`:

```yaml
title:
  es: Billete falso
  en: Counterfeit bill
medium:
  es: Pluma bic sobre papel
  en: Bic pen on paper
```

Translation is optional per field: `resolveLocalized()` falls back to the
default locale, so a partially translated language still renders a complete
page. The schema only requires the default locale to be present, and rejects
keys that are not registered locales.

Do **not** translate `dimensions`, `year`, `status`, `order` or `image` — they
are locale-invariant. The status annotation's text comes from the message file,
and dimension _numbers_ are localized automatically by `formatDimensions()`
(Spanish renders `25,5 cm`, English `25.5 cm`).

## 5. Verify

```bash
docker compose run --rm web pnpm build
```

Then confirm on the built output:

- `/en/` renders, and `/` still serves Spanish unprefixed.
- `<html lang="en">` on the English page, `lang="es"` on the Spanish one.
- Both pages carry `hreflang` alternates for `es`, `en` and `x-default`, each an
  absolute URL.
- `sitemap-0.xml` lists both URLs with `xhtml:link` alternates.
- The status annotations and colophon read in the new language.
- An artwork field left untranslated falls back to Spanish rather than rendering
  blank.

## What you should not have touched

`ArtworkCard.astro`, `Seo.astro`, `JsonLd.astro`, `BaseLayout.astro`,
`Header.astro`, `Footer.astro`, `src/content.config.ts`, or
`scripts/optimize-images.mjs`. If a language needed a change in any of these, a
user-facing string was hardcoded somewhere — move it into the message files
instead of special-casing the locale.
