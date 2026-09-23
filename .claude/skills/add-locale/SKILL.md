---
name: add-locale
description:
  Add a new language to eduardopavon.co, or work on its i18n seam — register the
  locale, create its UI message file, translate artwork fields, and verify
  routing, hreflang and html lang. Use when adding or removing a language,
  translating strings, or asked how localization, t(), or locale fallback works.
---

# Add a locale

The seam is built so a language is a **content** change. If you find yourself
editing a route, a component or the collection schema, stop — something is wrong
with the approach, not with the seam.

Worked example below adds French (`fr`) to the Spanish and English already
there.

## 1. Register the locale

`src/i18n/config.ts` is the single edit point. `astro.config.ts` imports it, so
Astro's routing follows automatically.

```ts
export const LOCALES = ['es', 'en', 'fr'] as const;

export const LOCALE_METADATA: Record<
  Locale,
  { htmlLang: string; ogLocale: string; label: string }
> = {
  es: { htmlLang: 'es', ogLocale: 'es_ES', label: 'Español' },
  en: { htmlLang: 'en', ogLocale: 'en_US', label: 'English' },
  fr: { htmlLang: 'fr', ogLocale: 'fr_FR', label: 'Français' },
};
```

Leave the rest of that file alone. `DEFAULT_LOCALE` and `FALLBACK_LOCALE` do
different jobs (SPEC.md invariant 6), and adding a language is not a reason to
change either.

`PREFIX_DEFAULT_LOCALE` is `true`: every edition is prefixed, and the new one is
served from `/fr/` the moment it is in the list.

`label` is the endonym the language switcher shows.

## 2. Create the UI message file

Copy `src/i18n/ui/es.ts` to `src/i18n/ui/fr.ts` and translate the values. Keep
every key, keep `{placeholders}` intact.

Register it in `src/i18n/index.ts`:

```ts
import en from './ui/en';
import es from './ui/es';
import fr from './ui/fr';

const MESSAGES: Record<Locale, UiMessages> = { es, en, fr };
```

`UiMessages` takes its **keys** from the Spanish file and widens the values to
`string`, so a missing key is a **type error** —
`docker compose run --rm web pnpm check` proves the file is complete. A key that
exists in no other file is caught by the parity test in `tests/i18n.test.ts`
instead, since types cannot see an extra one.

## 3. Add the routes — there is nothing to do

`src/pages/[locale]/` generates one route per entry in `LOCALES`, and each
renders a body from `src/components/pages/`. Registering the locale in step 1 is
what creates `/fr/` and `/fr/404`.

**If you find yourself creating a file under `src/pages/`, stop.** The only
routes that are not generated are `index.ts` (the `/` negotiator, which reads
`Accept-Language` and needs no per-language branch) and `404.astro` (the
host-level fallback, which renders in `FALLBACK_LOCALE` by design).

## 4. Translate the artwork fields

Add the locale key to each entry in `src/content/artworks/*.yaml`:

```yaml
title:
  es: Billete falso
  en: Counterfeit bill
  fr: Faux billet
medium:
  es: Pluma bic sobre papel
  en: Bic pen on paper
  fr: Stylo Bic sur papier
```

Translating a **title** is an editorial decision, not a mechanical one: leaving
it out is a legitimate choice, and the entry then shows the Spanish title in
that edition. Ask the artist rather than deciding for them.

Translation is optional per field: `resolveLocalized()` falls back to the
default locale, so a partially translated language still renders a complete
page. The schema only requires the default locale to be present, and rejects
keys that are not registered locales.

Do **not** translate `dimensions`, `year`, `status`, `order` or `image` — they
are locale-invariant. `status` is not rendered on the page at all (it reaches
JSON-LD and `llms.txt`; see @DESIGN.md §6), and dimension _numbers_ are
localized automatically by `formatDimensions()` (Spanish renders `25,5 cm`,
English `25.5 cm`).

## 5. Verify

```bash
docker compose run --rm web pnpm build
```

Then confirm on the built output:

- `.vercel/output/static/fr/index.html` exists alongside the other editions.
- `<html lang="fr">` on it, and its canonical is `/fr/`, not `/`.
- Every page carries `hreflang` alternates for every locale plus `x-default`,
  each an absolute URL, with `x-default` on `FALLBACK_LOCALE`.
- `sitemap-0.xml` lists every edition with `xhtml:link` alternates.
- The colophon and the contact section read in the new language.
- An artwork field left untranslated falls back to Spanish rather than rendering
  blank.

And that `/` still negotiates, which is the part a new locale actually changes:

```bash
curl -sI -H 'Accept-Language: fr-FR,fr;q=0.9' http://localhost:4321/ | grep -i location
```

## What you should not have touched

`ArtworkCard.astro`, `Seo.astro`, `JsonLd.astro`, `BaseLayout.astro`,
`Header.astro`, `Footer.astro`, `Contact.astro`, `LanguageSwitcher.astro`,
anything in `src/components/pages/`, `src/pages/`, `src/content.config.ts`, or
`scripts/optimize-images.mjs`. If a language needed a change in any of these, a
user-facing string was hardcoded somewhere — move it into the message files
instead of special-casing the locale.
