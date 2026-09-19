# eduardopavon.com — roadmap

## Vision

The professional portfolio of Eduardo Pavón, an artist who draws with Bic
ballpoint pens. Its job is to present the work to galleries, curators,
collectors and press: large, faithful reproductions, accurate metadata, fast and
findable. It is a content site, not an application — static, framework-free and
built to stay cheap to run and easy to extend.

---

## Phase 1 — Foundations ✅ complete

Framework-free Astro + TypeScript foundations, one landing gallery, and a proven
deployment path.

- [x] Astro (7.3.3) + TypeScript strict, no UI framework, zero client JS
- [x] pnpm pinned via `packageManager`; Node pinned via `.nvmrc` / `engines`
- [x] Supply-chain hardening: frozen lockfile, exact pins, no lifecycle scripts,
      3-day release cooldown (see SECURITY.md)
- [x] Tailwind v4 via `@tailwindcss/vite`; minimal light/dark design foundation
- [x] Scripted, reproducible image import (`pnpm images:import`) — 2000px max
      edge, WebP q82; 41.5 MB of originals → 3.0 MB committed
- [x] `artworks` content collection (Zod), one YAML entry per work, 8 works
- [x] i18n seam: locale config as single edit point, `t()` for UI strings,
      locale-keyed artwork fields with default-locale fallback
- [x] Landing gallery: responsive, accessible, AVIF/WebP `srcset`, explicit
      width/height, lazy below the fold
- [x] SEO layer: canonical, OG/Twitter, JSON-LD (Person + VisualArtwork),
      sitemap, robots.txt, locale-driven `hreflang` and `<html lang>`
- [x] Split licensing: code MIT, artwork CC BY-NC-ND 4.0, declared in image
      metadata, `<head>` and JSON-LD
- [x] Docker-only local development: no host install, `node_modules` in a named
      volume, Dev Container for editor IntelliSense; bind-mount HMR verified
      (CSS hot-swaps in place, TS/Astro edits reload)
- [x] `output: 'static'` + `@astrojs/vercel` adapter — serverless seam ready,
      zero functions shipped
- [x] Docs: README, SECURITY.md, ARTWORK-LICENSE.md, CLAUDE.md, this file,
      `add-artwork` and `add-locale` skills, `.claude/settings.json`,
      `.devcontainer/`
- [x] Deployed to Vercel — the repo is connected and deploys on push to
      production

### Explicitly out of scope for Phase 1

About page · per-artwork detail pages · CMS · a second language · contact form
or any server route · language-switcher UI · dark-mode toggle · analytics ·
lightbox or any client-side interaction.

### Decisions and deferrals from Phase 1

- **Content collection over a typed module.** The collection gives build-time
  validation, generated types, and `getStaticPaths` over `getCollection()`, so
  Phase 3's detail pages need no data migration.
- **One YAML file per artwork.** Keeps "add an artwork" to one image plus one
  file, with no shared file to conflict on.
- **`astro.config.ts`, not `.mjs`.** Lets the config import the locale list from
  `src/i18n/config.ts`, so routing and app code cannot drift.
- **Content config at `src/content.config.ts`.** Astro 5+ resolves it relative
  to `src/`; the repo root is no longer supported.
- **`zod` is a direct dependency.** Astro 7 deprecates re-exporting `z` from
  `astro:content`.
- **TypeScript pinned to 5.9.3.** `@astrojs/check` does not yet support
  TypeScript 7.
- **Max edge 2000px, not 2400px.** Chosen empirically: the scanned bond-paper
  work (`retazos-serie`) exceeded the 1 MB budget at 2400.
- **Dimensions normalized to structured width × height.** The source filenames
  mixed both orders. Each work's true orientation was derived by comparing the
  dimension pair against its image's aspect ratio: six were width-first,
  `billete-falso` and `crisalida` were height-first (corroborated for
  `crisalida` by its original filename's explicit `(H) x (W)` labels). Stored as
  `{ width, height, unit }`, rendered via `formatDimensions()` and published as
  real schema.org `width`/`height` with UN/CEFACT unit codes.
- **Dimension numbers are locale-formatted.** `Intl.NumberFormat` on the active
  locale, so Spanish renders `25,5 cm`.
- **No `tabindex` on gallery cards.** Nothing is interactive yet; focusable
  static figures would add empty stops. They become links in Phase 3.
- **`acquireLicensePage` omitted from JSON-LD.** It needs a real contact page;
  add it in Phase 6.
- **Invariant #1 amended in Phase 1.7 to allow one client script.** A lens that
  follows the cursor requires pointer tracking and CSS has no equivalent, so the
  magnifier cannot exist under "zero client JS". The exception is bounded by
  mechanism rather than by prose: a test fails if a second script appears or if
  the first exceeds its budget. The alternative — dropping the magnifier — was
  the designer's call, and they took the exception knowingly.
- **A second image derivative tier, revising the Phase 1 single-tier decision.**
  The gallery tier stays at 2000px; a detail tier at 3000px feeds the magnifier
  and Phase 3, at its own 2.5 MB budget rather than a loosened one. Committed
  artwork grows from ~3.0 MB to ~10 MB. The pairing is derived by slug in
  `src/artworks.ts`, so no schema field and no half-configured entry.
- **The cadence was specified as a composed page and then reduced to one
  column.** Five slots with differing spans, a facing spread and a vertical drop
  were built and reviewed; the designer replaced them with a single column at a
  common measure, because works at differing sizes read as some being too large.
  Rhythm is now the cadence's only instrument. Recorded so the offsets are not
  reinstated from the section that once described them.
- **The typeface was replaced, reversing the Phase 1 self-hosting decision.**
  Urbanist gave way to Irregardless Variable for headings and Polymath Text for
  body, both from Adobe Typekit, at the designer's direction. The cost is real
  and recorded in DESIGN.md: a render-blocking third-party stylesheet,
  `font-display: auto`, no generated fallback metrics, and a privacy surface —
  all properties Phase 1 had bought by self-hosting. Astro's Adobe provider
  would restore them; whether the licence allows self-hosting is an open
  question for the artist, not a technical one.
- **The glazing's first build read as a border.** Concentric box-shadow rings
  are uniform all the way round, and uniform is what a mount looks like. The rim
  is now a conic gradient masked to the ring, with one shared light angle, so
  the edge varies the way glass does.

### Open questions

- **`sin-titulo` dimensions are unreliable.** Its image has an aspect ratio of
  0.662, but the recorded `28.34 x 31.3 in` gives 0.905 either way round — a 37%
  mismatch that no ordering explains, and its original filename's `(H) x (W)`
  labels imply a landscape work while the image is portrait. The entry currently
  uses `28.34 × 31.3 in` (the orientation-consistent reading). Have the artist
  re-measure.
- Confirm the gallery `order` reflects how the artist wants the work hung.

---

## Phase 1.5 — CI and tests ✅ complete

Vercel builds and deploys on push, so CI is the **gate in front of** it.

- [x] `.github/workflows/ci.yml` — frozen install → `astro check` → tests →
      build, on pull requests and pushes to `main`
- [x] CI installs natively rather than in the dev container, to mirror how
      Vercel builds
- [x] Actions pinned by commit SHA; Dependabot configured for actions and npm
- [x] CI guard fails if `pnpm.onlyBuiltDependencies` becomes non-empty
- [x] Prettier + ESLint (`eslint-plugin-astro`, a11y rules,
      `eslint-config-prettier` last), enforced by a container-aware
      `.githooks/pre-commit` on staged files and re-checked in CI
- [x] Vitest suite (37 tests today): i18n helpers, slug derivation, and content
      integrity (asset exists and is under budget, no orphans, unique `order`,
      known `status`, and dimensions in the same orientation as the image — the
      exact class of bug found in Phase 1, verified to fail on a swap)

Playwright/E2E deliberately deferred; there is no client-side behaviour to
exercise yet.

## Phase 1.6 — Design pass ✅ complete

- [x] Urbanist variable font, self-hosted via Astro's Fonts API (no runtime
      Google request, preloaded, fallback metrics)
- [x] Fluid display type scale, refined spacing and hairline rules
- [x] Fixed-ratio gallery mat so captions align and nothing is cropped
- [x] `@view-transition` cross-document opt-in; per-artwork
      `view-transition-name` already in place for Phase 3's morph
- [x] Scroll reveals via `animation-timeline: view()`, guarded by `@supports`
      and `prefers-reduced-motion`
- [x] Still zero client JS

### Notes

- **Motion stayed CSS-only** to preserve invariant #1. Cross-document view
  transitions and scroll-driven animations are Chrome/Safari today (checked Sept
  2026); Firefox degrades to plain navigation with no breakage. Revisit Astro's
  `<ClientRouter />` only if that trade stops being acceptable.
- **The gallery → detail morph is deliberately not built.** It needs a second
  page; the names are in place so Phase 3 only has to match them.
- **Two real bugs were found and fixed during this pass**, both invisible to the
  existing tests:
  - File-watch polling stalled `astro dev` outright once `node_modules` grew
    with the lint/test tooling. Fixed by excluding `node_modules` from the
    watcher; HMR verified again afterwards.
  - The artwork was being cropped inside the mat, because percentage heights do
    not resolve against an aspect-ratio-derived height. Fixed with absolute
    positioning plus `object-fit: contain`.
- **These are the argument for E2E later.** Unit tests cannot see a layout crop
  or a dev server that never binds. Worth revisiting Playwright when Phase 3
  adds a second page and real navigation.

## Cleanup pass — post-Phase 1.6

A reuse/simplification/efficiency/altitude review produced these changes:

- `src/artworks.ts` now owns collection access and alt text, so `index` and
  `404` no longer duplicate the sort/featured/alt logic — and the OG alt text no
  longer silently ignored an authored `alt:` field that the card honoured.
- `JsonLd` takes collection entries directly instead of a hand-copied field
  interface; `src/site.ts` owns the names, licence, `ARTWORK_STATUSES` and the
  copyright wording, which `scripts/optimize-images.mjs` now imports rather than
  restating.
- Translated sentences with a link use `splitAroundSlot()`, which throws when a
  translation drops the placeholder instead of truncating the sentence.
- The locale-generic helpers (`resolveLocalized`, `localizePath`) accept any
  locale string, so the fallback tests no longer need `as never` casts.

Two review findings were rejected after testing them:

- Replacing the schema's open locale map with `z.record(z.enum(LOCALES), …)`
  would require **every** locale on every field, breaking partial-translation
  fallback the moment a second language is added.
- Dropping `h-full w-full` as "redundant next to `absolute inset-0`" would
  reintroduce the crop bug: an absolutely positioned replaced element with
  `inset: 0` renders at its intrinsic size, measured at 1542×2000 inside a
  200×250 box.

## Phase 1.7 — Design system ✅ complete

Phase 1 shipped infrastructure with placeholder styling. This pass made the
design decisions, wrote them down, and proved them in the pages that exist.

- [x] `DESIGN.md` at the project root: intent, principles, foundations, the
      cadence, page archetypes, components, motion, accessibility,
      anti-patterns, and the open questions the direction did not settle
- [x] Closed palette — ink, ground, pen, plus `pen-red` for large text on dark
      grounds — light mode only, no muted token; hierarchy from weight, size,
      space and rule
- [x] `global.css` rebuilt from the document; the dark-mode block deleted and
      `color-scheme: light` declared
- [x] Gallery rebuilt as one column at a common plate measure, paced by a
      five-slot spacing cycle; plates carry each work's own aspect ratio, so
      nothing can be cropped
- [x] Glazing and loupe as one glass material sharing tokens, drawn on the work
      rather than around it, built from the palette colours
- [x] Sticky title card — the name on one line at page width, shrinking on
      scroll — with the list of plates beneath it, linking to each work
- [x] The one sanctioned client script: the hover magnifier, ~1.2 KB shipped,
      gated to fine pointers, progressive, dismissible
- [x] Second image derivative tier at 3000px for the magnifier and Phase 3
- [x] New guards in `tests/`: palette containment, script singularity and
      budget, reduced-motion containment, and both image budgets — each observed
      failing before it passed

### Explicitly out of scope for Phase 1.7

Any new page · the about page · per-artwork detail pages · any route or endpoint
· a second locale · a CMS · any new dependency.

### Decisions from Phase 1.7

- **Six things were specified, built, found wrong and replaced**, each corrected
  in DESIGN.md as well as in the code: the cadence's per-slot geometry and
  height caps; the glazing's concentric rings, which read as a border, and then
  its weight, which read as a mount; the specular rail, which ran off the plate
  and across the caption; the `backdrop-filter` rim; the hero's phone reading
  order, which put the list of plates ahead of the first drawing; and a spacing
  rule tied to a vertical drop that no longer exists.
- **The hero was removed outright**, after the gallery became one column. A
  frontispiece spread privileges one work, which is a claim the single column
  had already given up making. The home page now runs name → contents → work.
- **Refraction was written off as non-interoperable, and that was wrong.** Only
  `backdrop-filter: url(…)` is Chromium-only, and the loupe never needed it: it
  carries its own image layer, so the displacement runs through plain `filter`.
  The lens really does bend light, via `public/glass-displacement.svg`.
- **The palette went from three values to four.** `--color-pen-red` was added
  when the masthead moved to an ink field and the accent measured 1.86:1 on it.
  It arrived bounded to large text on dark grounds — the price of a fifth would
  be the same: a measured failure no existing value solves, plus a written rule
  for where it may not go.

## Phase 1.8 — Site structure

The next phase, and the reason Phase 1.7 stopped where it did: decide what the
site _is_ — which pages exist, what each is for, and in what order they ship. It
sequences the existing Phases 2, 3 and 6 rather than replacing them, and it
builds against a design system that is already proven rather than theoretical.

Inherited from @DESIGN.md's Outstanding list: the about and detail archetypes,
prev/next, the list of plates becoming route navigation, and closing the
magnifier's accessible-equivalent gap (the lens shipped before the full-bleed
detail page it points at).

## Phase 2 — About page

A biography/statement page at `/sobre` (localized), reusing `BaseLayout` and the
SEO layer. Adds an artist portrait and extends the `Person` JSON-LD.

## Phase 3 — Per-artwork detail pages

`/[locale]/obra/[slug]` generated from the existing collection via
`getStaticPaths`. Full-size image, complete metadata, prev/next. Gallery cards
become links. Adds `VisualArtwork` pages and sitemap entries.

## Phase 4 — CMS / content pipeline

Let the artist add work without touching the repo. Must preserve the image
optimization step and the locale-keyed field model.

## Phase 5 — Additional language(s)

English first, via the `add-locale` skill. No route, component or schema changes
expected — this is the test of the Phase 1 i18n seam. Adds a language-switcher
UI.

## Phase 6 — Contact form

A single on-demand route (`src/pages/api/contact.ts`,
`export const prerender = false`) deployed as one Vercel serverless function;
the rest of the site stays static. **Email provider and anti-spam approach are
deliberately undecided** — the seam is provider-agnostic and must stay that way.
Also the point at which `acquireLicensePage` gets a real target.

---

## Architecture invariants

These hold across every phase. Breaking one is a foundation change, not a
feature.

1. **No UI framework, and one sanctioned client script.** Zero client JS by
   default; `src/scripts/magnifier.ts` is the single exception, gated to fine
   pointers and budgeted. Amended in Phase 1.7 — see the decisions log and
   @DESIGN.md. A second script is a foundation change, not a feature.
2. **pnpm only**, frozen lockfile, exact pins, no unsanctioned lifecycle
   scripts, release cooldown on.
3. **Static output.** On-demand rendering is per-route and exceptional; never
   global SSR.
4. **Prettier owns formatting.** No hand-formatting, no stylistic lint rules.
5. **The i18n seam holds.** No user-facing string hardcoded in a component; the
   locale list stays a single edit point.
6. **Images go through the import script and `astro:assets`.** Originals never
   enter the repo; `public/` is only for unprocessed files.
7. **Licensing stays split** — code MIT, artwork CC BY-NC-ND 4.0 — and stays
   machine-readable.
8. **OS-agnostic, container-only.** Identical commands and files on Windows,
   macOS and Linux. Local work happens in Docker; a host `node_modules` is a
   bug. Commands must not depend on a shell's path or variable syntax.
