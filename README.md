# eduardopavon.co

Portfolio of the artist **Eduardo Pavón**, who draws with Bic ballpoint pens.

A framework-free [Astro](https://astro.build) site: static prerendered HTML in
Spanish and English, Tailwind CSS for styling, deployed to Vercel. It ships
**one** client script — a magnifier over each drawing — and no framework,
hydration or other runtime.

## Licences

The **source code** is MIT ([LICENSE](LICENSE)). The **artworks, their
reproductions and the artwork texts are not** — they are © José Eduardo
Hernández Pavón and licensed [CC BY-NC-ND 4.0](ARTWORK-LICENSE.md): share with
credit, no commercial use, no derivatives. Forking the code grants no right to
the images in `src/assets/artworks/`.

## Documentation

Each document owns one thing:

- [SPEC.md](SPEC.md) — the roadmap, open questions and architecture invariants.
- [DESIGN.md](DESIGN.md) — design intent; `src/styles/global.css` owns the
  values.
- [SECURITY.md](SECURITY.md) — the supply-chain posture, and how to report a
  vulnerability.
- [CLAUDE.md](CLAUDE.md) — working rules for coding agents.
- `.claude/skills/` — the procedures for adding an artwork or a language.

## Requirements

**Docker** — that is the whole list. Dependencies, the dev server, checks,
builds and the image import all run in the container; `node_modules` lives in a
named volume the host never sees. Node (`.nvmrc`) and pnpm (`packageManager`)
are pinned for the container and for Vercel.

## Run locally

```bash
docker compose up
```

The site is served at <http://localhost:4321> and hot-reloads on every save.
Rebuild the image after changing dependencies:

```bash
docker compose up --build
```

An **empty** `node_modules/` appears on the host: it is only the mountpoint for
the named volume, stays at 0 bytes, and is gitignored.

**Slow start on Windows.** Docker Desktop reads a bind-mounted Windows path
slowly, and Vite's dependency scan makes tens of thousands of reads. Clone the
repo inside WSL2 and run the same command there; macOS and Linux are unaffected.

### Editor setup

Open the project in VS Code or Cursor and choose **Reopen in Container**
(`.devcontainer/devcontainer.json`). The TypeScript server then runs inside the
container, with the Astro and Tailwind extensions, while the host stays free of
`node_modules`. Without it your editor has no types to resolve; run `pnpm check`
in the container instead.

## Commands

| Command                                    | Purpose                       |
| ------------------------------------------ | ----------------------------- |
| `docker compose up`                        | Dev server with hot-reload    |
| `docker compose run --rm web pnpm check`   | Type check                    |
| `docker compose run --rm web pnpm test`    | Run the test suite            |
| `docker compose run --rm web pnpm lint`    | ESLint                        |
| `docker compose run --rm web pnpm format`  | Prettier, writing in place    |
| `docker compose run --rm web pnpm build`   | Type check, then build        |
| `docker compose run --rm web pnpm preview` | Serve the production build    |
| `docker compose down`                      | Stop and remove the container |

Inside the Dev Container terminal, drop the prefix: `pnpm check`, `pnpm test`,
`pnpm build`. `pnpm test:watch` reruns on change.

### Pre-commit hook

Enable it once per clone:

```bash
git config core.hooksPath .githooks
```

It format-checks and lints the staged files in the container. Skip a run with
`git commit --no-verify`; CI re-checks both.

### Tests

`vitest`, in `tests/`, covering what carries regression risk:

- **i18n** — locale fallback, path localization, negotiation, interpolation,
  dimension formatting
- **Slugs** — the filename → slug derivation used by the importer
- **Content integrity** — both image tiers present and within budget, a
  placeholder per entry, no orphans, unique `order`, known `status`, and
  dimensions recorded in the same orientation as the image
- **Design guards** — listed in [DESIGN.md](DESIGN.md) §10

### CI

`.github/workflows/ci.yml` runs on every pull request and push to `main`: frozen
install, format check, lint, type check, tests and build, then post-build checks
that no font ships `font-display:auto`, that every sitemap URL gets a CSP
header, and that no dependency build script is allowlisted. Vercel deploys on
push, so CI is the gate in front of it.

## Adding an artwork

Originals are never committed. Point the importer at their folder once, in
`.env` (copy `.env.example`), with forward slashes on every OS:

```
ARTWORK_ORIGINALS=C:/Users/you/Downloads/eduardopavon-images
```

Then run:

```bash
docker compose --profile tools run --rm images
```

The full procedure, including the content entry, is the `add-artwork` skill in
`.claude/skills/add-artwork/SKILL.md`.

## Deploying

Production is built by **Vercel's Astro framework preset**. The `Dockerfile` is
for local development only and is never deployed.

One-time setup in the Vercel dashboard:

1. **Add New → Project**, import the Git repository.
2. Framework preset: **Astro** (detected automatically).
3. Build command: `pnpm build`
4. Output directory: leave as the preset default (the `@astrojs/vercel` adapter
   writes `.vercel/output`).
5. Install command: `pnpm install --frozen-lockfile`
6. Node.js version: **24.x**, to match `.nvmrc`.
7. Add the custom domain. `www.eduardopavon.co` is canonical (`SITE_ORIGIN` in
   `src/site.ts`).

The `SITE_URL` environment variable overrides the site URL used for canonical,
OG and sitemap URLs — useful for preview deployments.
