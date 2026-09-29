import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import type { AstroIntegration, AstroUserConfig } from 'astro';
import { defineConfig, fontProviders } from 'astro/config';
import { DEFAULT_LOCALE, LOCALES, LOCALE_METADATA, PREFIX_DEFAULT_LOCALE } from './src/i18n/config';
import { SITE_ORIGIN } from './src/site';

const SITE = process.env.SITE_URL ?? SITE_ORIGIN;
const TYPEKIT_KIT = 'ulk1nsi';

const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true';

/* Split, so a build in a second container cannot cost the dev server a re-scan. */
const cacheRoot = process.env.VITE_CACHE_DIR;
const cacheDir = cacheRoot
  ? `${cacheRoot}/${process.argv.includes('dev') ? 'dev' : 'other'}`
  : undefined;

// Typekit's own font-display would beat the `display` below. See DESIGN.md.
type AdobeProvider = ReturnType<typeof fontProviders.adobe>;
type ProviderStorage = Parameters<NonNullable<AdobeProvider['init']>>[0]['storage'];

// The kit's cache key never changes with the kit, so a cached copy goes stale.
const uncached = {
  getItem: async (_key: string, init?: () => unknown) => (init ? init() : null),
  setItem: () => {},
} as ProviderStorage;

function adobe(config: { id: string }): AdobeProvider {
  const provider = fontProviders.adobe(config);
  return {
    ...provider,
    init: (context) => provider.init?.({ ...context, storage: uncached }),
    async resolveFont(options) {
      const resolved = await provider.resolveFont(options);
      if (!resolved) return resolved;
      return {
        fonts: resolved.fonts.map(({ display: _display, ...face }) => face),
      };
    },
  };
}

const FONTS = [
  // Super, the display role: its own entry so no Super italic ships.
  {
    name: 'Polymath Text',
    provider: adobe({ id: TYPEKIT_KIT }),
    cssVariable: '--font-polymath-super',
    weights: [900],
    styles: ['normal'],
    display: 'swap',
    subsets: ['latin'],
    fallbacks: ['system-ui', 'sans-serif'],
  },
  {
    name: 'Polymath Text',
    provider: adobe({ id: TYPEKIT_KIT }),
    cssVariable: '--font-polymath',
    weights: [400, 700],
    styles: ['normal', 'italic'],
    display: 'swap',
    subsets: ['latin'],
    fallbacks: ['system-ui', 'sans-serif'],
  },
] satisfies NonNullable<AstroUserConfig['fonts']>;

// Astro only warns when a face is missing.
const requireFontFaces: AstroIntegration = {
  name: 'require-font-faces',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const root = fileURLToPath(dir);
      const families = new Map<string, string>();
      const shipped = new Set<string>();
      let autoDisplay = false;

      for (const page of await readdir(root, { recursive: true })) {
        if (!page.endsWith('.html')) continue;
        const html = await readFile(path.join(root, page), 'utf8');
        for (const { cssVariable } of FONTS) {
          const family = new RegExp(`${cssVariable}:("[^"]+")`).exec(html)?.[1];
          if (family) families.set(cssVariable, family);
        }
        for (const [, face = ''] of html.matchAll(/@font-face\{([^}]*)\}/g)) {
          const get = (property: string) => new RegExp(`${property}:([^;]*)`).exec(face)?.[1];
          if (get('font-display') === 'auto') autoDisplay = true;
          shipped.add(`${get('font-family')} ${get('font-weight')} ${get('font-style')}`);
        }
      }

      const missing = FONTS.flatMap(({ cssVariable, weights, styles }) =>
        weights.flatMap((weight) =>
          styles
            .filter((style) => !shipped.has(`${families.get(cssVariable)} ${weight} ${style}`))
            .map((style) => `${cssVariable} ${weight} ${style}`),
        ),
      );
      if (missing.length > 0) {
        throw new Error(
          `Font faces missing from the build: ${missing.join(', ')}. ` +
            'The provider logged why above (DESIGN.md §3).',
        );
      }
      if (autoDisplay) throw new Error('A face shipped font-display:auto (DESIGN.md §3).');
    },
  },
};

export default defineConfig({
  site: SITE,
  // `/es` 308s to `/es/`, and the adapter writes each CSP route in that spelling.
  trailingSlash: 'always',

  // Adapter configured so one route can opt out, without global SSR.
  output: 'static',
  adapter: vercel({ staticHeaders: true }),

  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "base-uri 'none'",
        "object-src 'none'",
        "form-action 'none'",
        "frame-ancestors 'none'",
        'upgrade-insecure-requests',
        // Every plate inlines its placeholder as a data: URI.
        "img-src 'self' data:",
      ],
      // The plate carries its aspect ratio in a style attribute; hashes cannot cover one.
      styleDirective: { resources: [{ resource: "'unsafe-inline'", kind: 'attribute' }] },
    },
  },

  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LOCALES],
    routing: {
      prefixDefaultLocale: PREFIX_DEFAULT_LOCALE,
      // We own `/`; see src/pages/index.ts.
      redirectToDefaultLocale: false,
    },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: Object.fromEntries(
          LOCALES.map((locale) => [locale, LOCALE_METADATA[locale].htmlLang]),
        ),
      },
    }),
    requireFontFaces,
  ],

  image: {
    responsiveStyles: true,
    ...(process.argv.includes('dev')
      ? {}
      : { endpoint: { route: '/_image', entrypoint: './src/image-endpoint.ts' } }),
  },

  fonts: FONTS,

  vite: {
    ...(cacheDir ? { cacheDir } : {}),
    plugins: [tailwindcss()],
    /* esbuild: Lightning folds `animation-timeline` into the shorthand and drops it. */
    build: { cssMinify: 'esbuild' },
    server: {
      // Replaces Vite's defaults, and stat-ing node_modules stalls startup.
      watch: usePolling
        ? {
            usePolling: true,
            interval: 300,
            ignored: [
              '**/node_modules/**',
              '**/dist/**',
              '**/.astro/**',
              '**/.vercel/**',
              '**/.git/**',
            ],
          }
        : {},
    },
  },
});
