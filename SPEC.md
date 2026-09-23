# eduardopavon.co — roadmap

## Vision

The professional portfolio of Eduardo Pavón, an artist who draws with Bic
ballpoint pens. Its job is to present the work to galleries, curators,
collectors and press: large, faithful reproductions, accurate metadata, fast and
findable. It is a content site, not an application — static, framework-free and
built to stay cheap to run and easy to extend.

Design intent: @DESIGN.md · Hard rules and seams: @CLAUDE.md · Supply chain:
@SECURITY.md

---

## Shipped

| Phase                  | Delivered                                                                                                                       |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1 — Foundations        | Astro + TypeScript, the `artworks` collection, the i18n and SEO layers, scripted image import, Vercel deploy                    |
| 1.5 — CI and tests     | CI as the gate in front of Vercel; Vitest guards for i18n, slugs and content integrity                                          |
| 1.6 — Design pass      | Self-hosted fonts, fluid type scale, CSS-only view transitions and scroll reveals                                               |
| 1.7 — Design system    | @DESIGN.md, the closed palette, the cadence, the glass material, the magnifier, the second image tier                           |
| 5 — English edition    | `/es/` and `/en/` from one locale-generated route; `/` negotiates `Accept-Language`; a language switcher in the colophon        |
| 5.5 — Performance pass | `font-display: swap` enforced, `www` as the canonical host, a CSP, contrast fixed in the scroll reveal                          |
| 5.6 — Material pass    | Scrollbars in the site's blue and `--color-pen-pale` as a bounded fifth palette value; the glass redrawn from two named objects |

Decisions that still bind future work live in **Architecture invariants** below,
in @DESIGN.md as design rules, and in @SECURITY.md as supply-chain rules. How
any of it came to be is in the git history and the pull requests.

---

## Next

### Phase 1.8 — Site structure

Decide what the site _is_: which pages exist, what each is for, and in what
order they ship. Sequences Phases 2, 3 and 6 rather than replacing them.

Inherited from @DESIGN.md's Outstanding list: the about and detail archetypes,
prev/next, the list of plates becoming route navigation, and the magnifier's
accessible equivalent — the lens shipped before the detail page it points at.

### Phase 2 — About page

A biography/statement page at `/sobre` (localized), reusing `BaseLayout` and the
SEO layer. Adds an artist portrait and extends the `Person` JSON-LD.

### Phase 3 — Per-artwork detail pages

`/[locale]/obra/[slug]`, generated from the collection via `getStaticPaths`.
Full-size image, complete metadata, prev/next. Gallery cards become links. Adds
`VisualArtwork` pages and sitemap entries.

### Phase 4 — CMS / content pipeline

Let the artist add work without touching the repo. Must preserve the image
optimization step and the locale-keyed field model.

### Phase 6 — Contact form

A single on-demand route (`src/pages/api/contact.ts`,
`export const prerender = false`) deployed as one Vercel function; the rest of
the site stays static. **Email provider and anti-spam approach are deliberately
undecided** — the seam is provider-agnostic and must stay that way. Also the
point at which `acquireLicensePage` gets a real target.

---

## Open questions

- **`sin-titulo`'s dimensions do not match its image.** The image's aspect ratio
  is 0.662; the recorded `28.34 × 31.3 in` gives 0.905 in either order. The
  entry uses the orientation-consistent reading. The artist should re-measure
  before Phase 3 shows the work full size beside those numbers.
- **Confirm the gallery `order`** reflects how the artist wants the work hung.
- **Confirm the eight English artwork titles.** Reverting one is deleting a
  line; the entry then falls back to Spanish on its own.
- **Confirm the Typekit licence permits self-hosting** the two families.

---

## Architecture invariants

These hold across every phase. Breaking one is a foundation change, not a
feature.

1. **No UI framework, and one sanctioned client script.** Zero client JS by
   default; `src/scripts/magnifier.ts` is the single exception, gated to fine
   pointers and budgeted. A second script is a foundation change. Test-enforced.
2. **pnpm only**, frozen lockfile, exact pins, no unsanctioned lifecycle
   scripts, release cooldown on.
3. **Static output.** On-demand rendering is per-route and exceptional; never
   global SSR. One route is on-demand: `/`, which negotiates the visitor's
   language, because the answer varies per request. Every page it points at is
   prerendered. A contact form is the same shape, not a reason for global SSR.
4. **Prettier owns formatting.** No hand-formatting, no stylistic lint rules.
5. **The i18n seam holds.** No user-facing string hardcoded in a component;
   `src/i18n/config.ts` is the single edit point for the locale list, and the
   locale routes are generated from it. Adding a language must not require
   route, component or schema changes.
6. **Two locale constants, two jobs.** `DEFAULT_LOCALE` (`es`) is the authoring
   language — what a missing translation falls back to, and what the content
   schema requires. `FALLBACK_LOCALE` (`en`) is what a visitor gets when we do
   not publish their language; it is also `x-default` and the language of the
   host-level `404`. Do not collapse them.
7. **Images go through the import script and `astro:assets`.** Originals never
   enter the repo; `public/` is only for unprocessed files.
8. **Licensing stays split** — code MIT, artwork CC BY-NC-ND 4.0 — and stays
   machine-readable. Rights constants live in `src/site.ts`.
9. **`SITE_ORIGIN` is the one place the host is written.** `astro.config.ts`
   imports it, so canonical, hreflang, sitemap, `robots.txt`, OG and JSON-LD
   cannot name a host the site does not serve.
10. **OS-agnostic, container-only.** Identical commands and files on Windows,
    macOS and Linux. Local work happens in Docker; a host `node_modules` is a
    bug. Commands must not depend on a shell's path or variable syntax.
