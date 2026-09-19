---
name: add-artwork
description:
  Add a new artwork to the eduardopavon.co portfolio — optimize and import the
  image, create the content entry, and verify it reaches the gallery and
  structured data. Use when adding, importing, replacing or removing an artwork,
  or when asked about artwork images, slugs, or the image optimization settings.
---

# Add an artwork

Four things must land together: **two optimized image assets** — the gallery
tier and the detail tier — a **blurred placeholder**, and a **content entry**.
The slug is the link between all of them and must match exactly.

## 1. Import the image

Originals are never committed. Put the original in the folder that `.env`'s
`ARTWORK_ORIGINALS` points at (never inside the repo), then run:

```bash
docker compose --profile tools run --rm images
```

Everything runs in the container; nothing is installed on the host. The script
is idempotent — it reprocesses the whole folder, so it is safe to re-run with
the full source set.

One run writes **both tiers**. Canonical settings live in the `TIERS` array in
`scripts/optimize-images.mjs`:

| Tier        | Max longest edge | Output                                   | Budget   | Used by                |
| ----------- | ---------------- | ---------------------------------------- | -------- | ---------------------- |
| **gallery** | 2000 px          | `src/assets/artworks/<slug>.webp`        | < 1 MB   | every page             |
| **detail**  | 3000 px          | `src/assets/artworks/detail/<slug>.webp` | < 2.5 MB | the magnifier, Phase 3 |

Both are WebP at quality 82, and neither upscales or crops. **Commit both.** A
work with only the gallery tier renders, but its magnifier silently does nothing
— the detail tier is what the lens reads, and `tests/content.test.ts` fails if
either tier is missing, orphaned or over budget.

The same run rewrites `src/assets/artworks/placeholders.json`, a 20px blurred
copy of each work inlined as a data URI, which is what a plate shows until its
image paints. **Commit it too**: it is regenerated wholesale, so it is one file
for the whole set rather than one per work, and a missing entry fails the suite.

The budgets are the exported `MAX_COMMITTED_BYTES` and `MAX_DETAIL_BYTES`, which
the test imports; they are never written twice. Do not change any of these
values for one image. If a new work exceeds its budget, lower `QUALITY` or that
tier's `maxEdge` for the whole set and re-import, then record the change in
SPEC.md.

There is **no field to add** for the detail tier: `src/artworks.ts` pairs it to
the entry by slug.

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
  dimensions, year, and the correct status annotation (or none when
  `status: null`).
- The work appears in the page's JSON-LD `hasPart` array with `name`,
  `artMedium`, `dateCreated`, `size`, `width`, `height`, `image` and the rights
  fields.
- The rendered dimensions match the image's orientation.
- Both committed `.webp` files exist and are under their budgets — run
  `docker compose run --rm web pnpm test`, which checks this for you.
- Hovering the new work on a fine pointer shows the magnifier, sharp rather than
  blurred, which is what proves the detail tier landed.

Nothing else needs editing — the gallery, structured data and sitemap all read
from the collection.

## Removing an artwork

Delete all three of `src/content/artworks/<slug>.yaml`,
`src/assets/artworks/<slug>.webp` and `src/assets/artworks/detail/<slug>.webp`,
remove the original from the `ARTWORK_ORIGINALS` folder and re-run the import so
`placeholders.json` loses its entry, then renumber `order` on the remaining
entries so there are no gaps. The orphan test covers both tiers and the
placeholder map, so a forgotten asset or a stale entry fails CI.
