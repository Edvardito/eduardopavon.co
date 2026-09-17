---
name: add-artwork
description:
  Add a new artwork to the eduardopavon.com portfolio — optimize and import the
  image, create the content entry, and verify it reaches the gallery and
  structured data. Use when adding, importing, replacing or removing an artwork,
  or when asked about artwork images, slugs, or the image optimization settings.
---

# Add an artwork

Two things must land together: an **optimized image asset** and a **content
entry**. The slug is the link between them and must match exactly.

## 1. Import the image

Originals are never committed. Put the original in the folder that `.env`'s
`ARTWORK_ORIGINALS` points at (never inside the repo), then run:

```bash
docker compose --profile tools run --rm images
```

Everything runs in the container; nothing is installed on the host. The script
is idempotent — it reprocesses the whole folder, so it is safe to re-run with
the full source set.

Canonical settings, defined in `scripts/optimize-images.mjs`:

| Setting          | Value                                        |
| ---------------- | -------------------------------------------- |
| Max longest edge | **2000 px** (never upscales, never crops)    |
| Format           | **WebP**                                     |
| Quality          | **82**                                       |
| Output           | `src/assets/artworks/<slug>.webp`            |
| Size budget      | **< 1 MB** committed; the script warns above |

Do not change these values for one image. If a new work exceeds 1 MB, lower
`QUALITY` or `MAX_EDGE` for the whole set and re-import, then record the change
in SPEC.md.

The script also embeds EXIF and XMP rights metadata (artist, copyright, CC
BY-NC-ND 4.0). That happens automatically — do not strip it.

### Slug

The script derives the slug from the text **before the first hyphen** in the
original filename, lowercased and ASCII-folded:

```
"Sin título - Pluma bic sobre papel - 28.34 x 31.3 in - 2021.jpg"  ->  sin-titulo
"Retazos (serie) - Pluma bic sobre papel bond - ... .png"          ->  retazos-serie
```

If the original is named differently, rename it before importing. A slug
collision aborts the run. The slug is permanent: it is the entry filename, the
asset filename, and the future detail-page route.

## 2. Create the content entry

Add `src/content/artworks/<slug>.yaml`:

```yaml
title:
  es: Billete falso
medium:
  es: Pluma bic sobre papel
dimensions:
  width: 37
  height: 25.5
  unit: cm
year: 2023
status: framed
order: 1
image: ~/assets/artworks/billete-falso.webp
```

**Locale-keyed** (a map per language, default locale `es` required): `title`,
`medium`, and the optional `alt`.

**Locale-invariant** (written once): `dimensions`, `year`, `status`, `order`,
`image`.

Field notes:

- `dimensions` — `width`, `height` and `unit` (`cm` or `in`). **Always width
  first**, whatever order the artist wrote it in. Sanity-check against the
  image: a landscape image must have `width > height`. Rendering and JSON-LD
  both derive from these numbers, so a swap is visible and wrong.
- `status` — `framed`, `sold`, or `null`. It is an enum, not a label: the
  visible text comes from `status.framed` / `status.sold` in
  `src/i18n/ui/<locale>.ts`. Never put Spanish here.
- `order` — ascending gallery position. Renumber neighbours if inserting.
- `image` — use the `~/` alias, not a relative path.
- Untitled works keep the artist's own title (`Sin título`). Do not invent one.

## 3. Alt text

By default the alt text is generated from the `artwork.alt` template
(`"{title}, {medium}, por Eduardo Pavón"`). That is adequate, not good.

For a work with notable visual content, write real alt text describing what is
depicted:

```yaml
alt:
  es: Un billete de banco dibujado a mano, con un retrato alterado en el centro.
```

Keep it under ~125 characters and describe the image, not the metadata.

## 4. Verify

```bash
docker compose run --rm web pnpm build
```

Then confirm:

- The card appears in the gallery in the right `order`, with title, medium,
  dimensions, year, and the correct badge (or none when `status: null`).
- The work appears in the page's JSON-LD `hasPart` array with `name`,
  `artMedium`, `dateCreated`, `size`, `width`, `height`, `image` and the rights
  fields.
- The rendered dimensions match the image's orientation.
- The committed `.webp` is under 1 MB (`ls -la src/assets/artworks/`).

Nothing else needs editing — the gallery, structured data and sitemap all read
from the collection.

## Removing an artwork

Delete both `src/content/artworks/<slug>.yaml` and
`src/assets/artworks/<slug>.webp`, then renumber `order` on the remaining
entries so there are no gaps.
