# eduardopavon.com

Portfolio of the artist **Eduardo Pavón**, who draws with Bic ballpoint pens.

A framework-free [Astro](https://astro.build) site: static prerendered HTML,
zero client-side JavaScript, Tailwind CSS for styling, deployed to Vercel.

> **Two licences.** The **source code** is MIT. The **artworks and their
> reproductions are not** — they are © José Eduardo Hernández Pavón and licensed
> [CC BY-NC-ND 4.0](ARTWORK-LICENSE.md): share with credit, no commercial use,
> no derivatives. Forking the code does not grant any right to the images in
> `src/assets/artworks/`.

---

## Requirements

**Docker** — that is the whole list. Everything runs in the container:
dependencies, the dev server, type checking, builds and the image import.
Nothing is installed on your host, and `node_modules` lives in a named volume
that the host never sees.

Node and pnpm versions are pinned for the container and for Vercel (`.nvmrc` →
24.21.0, `packageManager` → pnpm 10.25.0), but you do not need either installed
locally.

## Run locally

```bash
docker compose up
```

The site is served at <http://localhost:4321>. Editing any file on your host
hot-reloads the browser — no rebuild, no restart.

Two details make that work, and both are easy to break:

- `compose.yaml` bind-mounts the project at `/app` **and** shadows
  `/app/node_modules` with a named volume. Without the named volume a stray host
  `node_modules` (built for Windows/macOS) would hide the container's Linux
  install.
- `CHOKIDAR_USEPOLLING=true` is set for the container, because file-change
  events do not cross a bind mount reliably on Windows or macOS.
  `astro.config.ts` reads it.

You will see an **empty** `node_modules/` directory appear on your host. That is
only the mountpoint Docker creates for the named volume — the packages
themselves live in the volume, not on your disk. It stays at 0 bytes, and it is
gitignored.

Rebuild the image after changing dependencies:

```bash
docker compose up --build
```

## Editor setup

Open the project in VS Code or Cursor and choose **Reopen in Container**
(`.devcontainer/devcontainer.json`). The TypeScript server then runs inside the
container, so you get full IntelliSense, inline type errors and the Astro and
Tailwind extensions — while your host stays free of `node_modules`.

Without the Dev Container your editor has nothing to resolve types against. That
is expected; run `pnpm check` in the container instead.

## Commands

All commands run in the container. `run --rm` starts a throwaway container that
shares the same dependency volume.

| Command                                    | Purpose                        |
| ------------------------------------------ | ------------------------------ |
| `docker compose up`                        | Dev server with hot-reload     |
| `docker compose run --rm web pnpm check`   | Type check                     |
| `docker compose run --rm web pnpm test`    | Run the test suite             |
| `docker compose run --rm web pnpm build`   | Type check, then build `dist/` |
| `docker compose run --rm web pnpm preview` | Serve the production build     |
| `docker compose down`                      | Stop and remove the container  |

Inside the Dev Container terminal, drop the prefix and run `pnpm check`,
`pnpm test`, `pnpm build` and so on directly. `pnpm test:watch` reruns on
change.

## Code style

Prettier formats, ESLint lints (with `eslint-plugin-astro`, including its
accessibility rules). ESLint never argues with Prettier —
`eslint-config-prettier` is applied last.

Enable the pre-commit hook once per clone:

```bash
git config core.hooksPath .githooks
```

The hook formats-checks and lints **only the staged files**, and runs them in
the container, so the host still needs nothing installed. If Docker is not
running it says so rather than failing cryptically. Skip a run with
`git commit --no-verify` — CI re-checks both, so a skipped hook cannot land
unformatted code.

## CI

`.github/workflows/ci.yml` runs on every pull request and every push to `main`:
frozen install → format check → lint → `astro check` → tests → build, plus a
guard that fails if a dependency build script gets allowlisted without review.

Vercel deploys on push, so CI is the gate in front of it. It installs natively
rather than in the dev container on purpose — that mirrors how Vercel builds,
which is what we are gating.

### Tests

`vitest`, covering the logic that carries real regression risk rather than
chasing coverage:

- **i18n** — default-locale fallback, path localization, message interpolation,
  dimension formatting
- **Slugs** — the filename → slug derivation used by the importer
- **Content integrity** — every entry has an asset under 1 MB, no orphaned
  assets, unique `order`, known `status`, and **dimensions recorded in the same
  orientation as the image**

That last test exists because of a real Phase 1 bug: the source filenames mixed
width-first and height-first, so a swapped pair silently published wrong
measurements. A swap flips the aspect ratio, which the test catches by name.

## Adding an artwork

Originals are **not** committed — they are multi-megabyte scans. Point the
importer at them once, in `.env` (copy `.env.example`). Use forward slashes on
every OS, Windows included:

```
# macOS / Linux
ARTWORK_ORIGINALS=/Users/you/Downloads/eduardopavon-images
# Windows — forward slashes, drive letter included
ARTWORK_ORIGINALS=C:/Users/you/Downloads/eduardopavon-images
```

Then:

```bash
docker compose --profile tools run --rm images
```

The path comes from `.env` rather than a shell variable so the same command
works in PowerShell, bash and zsh, and so no shell mangles the container paths.

The importer downscales to 2000px on the longest edge, encodes WebP at quality
82, and embeds EXIF/XMP rights metadata, writing
`src/assets/artworks/<slug>.webp`. Then add the matching
`src/content/artworks/<slug>.yaml` entry.

Full checklist: `.claude/skills/add-artwork/SKILL.md`.

## Architecture

```
src/
├── assets/artworks/     Optimized WebP, processed by astro:assets
├── components/
│   ├── layout/          Header, Footer
│   ├── seo/             Seo (head tags), JsonLd (structured data)
│   └── ui/              ArtworkCard, Badge
├── content/artworks/    One YAML entry per artwork
├── content.config.ts    Collection schema (Zod)
├── i18n/                Locale config, message files, t() and resolvers
├── layouts/             BaseLayout — <html lang>, head, chrome
├── pages/               File-based routes
└── styles/global.css    Tailwind entry + design tokens
```

`~/*` is a path alias for `src/*`, used in imports and in the `image:` field of
artwork entries.

**No UI framework.** No React, Vue, Svelte. No hydration directives, no client
runtime. This is a content and image portfolio; a framework would be pure
overhead and extra attack surface.

**Static output.** Every page is prerendered HTML on Vercel's CDN. That is
better for SEO and latency than SSR for content that does not vary per request.

### Design and motion

Type is **Urbanist**, a variable family self-hosted through Astro's Fonts API:
fetched and subset at build time, served from our own origin with preload and
fallback metrics, so there is no request to Google at runtime and no layout
shift when the webfont arrives.

All motion is CSS. No JavaScript is shipped for it, which keeps the
zero-client-JS invariant intact:

- **View transitions** — `@view-transition { navigation: auto; }` opts into
  cross-document transitions. Each artwork already carries a
  `view-transition-name`, so Phase 3's gallery → detail morph is a matter of
  matching names, not new machinery. Firefox does not support cross-document
  transitions yet and simply navigates; nothing breaks.
- **Scroll reveals** — `animation-timeline: view()`, wrapped in both `@supports`
  and `prefers-reduced-motion: no-preference`. Browsers without support never
  see the hidden start state, so content cannot be stranded invisible.

Artworks sit in a fixed-ratio **mat** so captions align across a row and the
gallery keeps an even rhythm. The image is absolutely positioned and uses
`object-fit: contain` — **percentage heights do not resolve against an
aspect-ratio-derived height**, and relying on them silently crops the artwork.
Never reintroduce `height: 100%` sizing there.

### Localization

The site ships in Spanish only, but the i18n seam is real and exercised: nothing
user-facing is hardcoded in a component.

- **UI strings** live in `src/i18n/ui/<locale>.ts` and are read via
  `t(locale, key)` / `useTranslations(locale)`.
- **Artwork fields** (`title`, `medium`, `alt`) are locale-keyed maps on the
  entry, read via `resolveLocalized(value, locale)`, which falls back to the
  default locale when a translation is missing. Locale-invariant fields (`slug`,
  `year`, `dimensions`, `status`, `image`) are stored once.
- `src/i18n/config.ts` is the single edit point for the locale list.
  `astro.config.ts` imports it, so routing and application code cannot drift.
- `<html lang>`, `hreflang` alternates and sitemap alternates are all derived
  from that list.

Adding a language requires no route, component or schema changes. The exact
steps are in `.claude/skills/add-locale/SKILL.md`.

### SEO

- Per-page `<title>`, `description` and `<link rel="canonical">` via
  `src/components/seo/Seo.astro`.
- Open Graph and Twitter Card tags, with an absolute `og:image`.
- JSON-LD (`schema.org`): a `Person` for the artist plus a `VisualArtwork` per
  piece, linked in one `@graph`.
- `sitemap-index.xml` via `@astrojs/sitemap`, referenced from `robots.txt`.
- Responsive AVIF/WebP via `astro:assets`, with explicit `width`/`height` (no
  layout shift) and lazy-loading below the fold.

Artwork dimensions are stored as structured `width`/`height`/`unit` and always
mean width × height, so JSON-LD publishes real `width` and `height`
`QuantitativeValue`s with UN/CEFACT unit codes. Numbers are formatted through
`Intl.NumberFormat` for the active locale — Spanish renders `25,5 cm`.

## Deploying

Production is built by **Vercel's Astro framework preset**. The dev `Dockerfile`
is never deployed — it exists only for local host parity.

One-time setup in the Vercel dashboard:

1. **Add New → Project**, import the Git repository.
2. Framework preset: **Astro** (detected automatically).
3. Build command: `pnpm build`
4. Output directory: leave as the preset default (the `@astrojs/vercel` adapter
   writes `.vercel/output`).
5. Install command: `pnpm install --frozen-lockfile`
6. Node.js version: **24.x**, to match `.nvmrc`.
7. Add the custom domain `eduardopavon.com`.

`site` in `astro.config.ts` is the production URL and drives canonical, OG and
sitemap URLs. It can be overridden per environment with the `SITE_URL`
environment variable — useful for preview deployments.

### Future contact form

A contact form would be a single on-demand route (`src/pages/api/contact.ts`
with `export const prerender = false`), deployed as one Vercel serverless
function while the rest of the site stays static. The `@astrojs/vercel` adapter
is already configured to make that possible without restructuring. The email
provider and anti-spam approach are deliberately undecided.

## Security

Supply-chain posture (frozen lockfile, blocked lifecycle scripts, release
cooldown, pinned toolchain) is documented in [SECURITY.md](SECURITY.md).

## License

This repository is licensed in two parts:

- **Source code** — MIT License, see [LICENSE](LICENSE).
- **Artworks, their reproductions and the artwork texts** — CC BY-NC-ND 4.0
  (share with credit; no commercial use, no derivatives), see
  [ARTWORK-LICENSE.md](ARTWORK-LICENSE.md).

The code license does **not** extend to the artwork. Rights are declared
machine-readably in the image metadata, the page `<head>` and the JSON-LD.
