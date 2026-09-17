# Security posture

This is a static site with no backend, no database, no authentication and no
user input. The realistic threat is therefore not runtime compromise — it is the
**supply chain**: a malicious or hijacked npm package executing on a developer
machine or in the build.

Every mitigation below is configured in the repo, not left to convention.

## Reproducible dependency graph

`pnpm-lock.yaml` is committed, and installs use `--frozen-lockfile` everywhere —
locally, in the Docker image, and in Vercel's install command. A frozen install
fails rather than silently resolving a different tree, so the graph cannot drift
between a developer's machine and production.

Direct dependencies are pinned to **exact versions** (no `^`, no `~`), enforced
by `save-exact=true` in `.npmrc`. Upgrades are always a visible, reviewable diff
rather than something that happens on the next install.

## No install-time lifecycle scripts

Malicious `postinstall` scripts are the most common npm attack vector: they run
automatically, with full user privileges, the moment a package is installed.

pnpm v10+ does not run dependency build scripts unless they are allowlisted in
`pnpm.onlyBuiltDependencies`. That allowlist is currently **empty** and should
stay that way; `dangerously-allow-all-builds=false` in `.npmrc` states the
guarantee explicitly so it survives a config or pnpm-version change.

`esbuild` reports a skipped build script on install. This is expected and safe:
esbuild ships its binary as a platform-specific optional package (`@esbuild/*`),
which pnpm installs normally, so nothing is missing. It has been left
un-allowlisted deliberately.

Before adding an entry, confirm the package genuinely cannot work without its
script, and record why in this file.

## Release cooldown

`minimumReleaseAge=4320` (3 days, in minutes) in `.npmrc` refuses to resolve any
version published more recently than that.

Compromised releases are typically detected and yanked within hours. A few days
of deliberate lag removes most of that blast radius at essentially no cost to a
project that does not need same-day dependency updates.

Requires pnpm ≥ 10.16. The current pin, 10.25.0, supports it.

## Pinned toolchain

- **pnpm** — exact version in `packageManager`, verified by Corepack.
- **Node** — `24.21.0` in `.nvmrc`, matched by the Docker base image
  (`node:24.21.0-alpine`) and by the Vercel project's Node setting.
- `engine-strict=true` makes a mismatched Node version fail the install rather
  than produce a subtly different tree.

## Minimal dependency surface

Runtime dependencies are deliberately few — the tooling below is all
`devDependencies` and never reaches the browser or the deployed site:

| Package             | Why                                               |
| ------------------- | ------------------------------------------------- |
| `astro`             | the framework                                     |
| `@astrojs/vercel`   | deploy adapter                                    |
| `@astrojs/sitemap`  | sitemap generation                                |
| `tailwindcss`       | styling                                           |
| `@tailwindcss/vite` | official Tailwind v4 integration                  |
| `zod`               | content schema (Astro deprecates re-exporting it) |
| `@astrojs/check`    | type checking (dev)                               |
| `typescript`        | type checking (dev)                               |
| `sharp`             | the artwork import script (dev)                   |

There is **no UI framework**. No React, Vue or Svelte means no client runtime,
no hydration, and a materially smaller dependency tree to trust.

New dependencies should be justified against this list.

## CI

`.github/workflows/ci.yml` installs with `--frozen-lockfile`, so a pull request
that changes dependencies without updating the lockfile fails rather than
resolving a new tree.

Third-party actions are pinned by **commit SHA**, not by tag — a tag can be
moved to point at new code, which is the same class of risk the lockfile guards
against. Dependabot updates the pins monthly.

A CI step fails the build if `pnpm.onlyBuiltDependencies` becomes non-empty, so
allowlisting a dependency's install script cannot land without a deliberate
change to that check.

The workflow's `permissions` are `contents: read` only.

## Registry

The default public npm registry over HTTPS only, set explicitly in `.npmrc`. Do
not point installs at a mirror or proxy, and do not run installs against
arbitrary registries.

## Secrets

This phase requires none, and none are committed. `.env*` is gitignored.

If a future phase needs a secret (for example an email provider key for the
contact form), it belongs in Vercel's environment variables — never in the repo,
and never in client-side code.

## Reporting a vulnerability

Open a private security advisory on the repository, or contact the maintainer
directly. Please do not open a public issue for an unfixed vulnerability.
