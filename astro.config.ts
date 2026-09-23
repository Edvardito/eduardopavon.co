import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { DEFAULT_LOCALE, LOCALES, LOCALE_METADATA, PREFIX_DEFAULT_LOCALE } from './src/i18n/config';
import { SITE_ORIGIN } from './src/site';

const SITE = process.env.SITE_URL ?? SITE_ORIGIN;

// Bind-mount file events are unreliable off Linux; compose sets this.
const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true';

/* Split, so a build in a second container cannot cost the dev server a re-scan. */
const cacheRoot = process.env.VITE_CACHE_DIR;
const cacheDir = cacheRoot
  ? `${cacheRoot}/${process.argv.includes('dev') ? 'dev' : 'other'}`
  : undefined;

// Typekit's own font-display would beat the `display` below. See DESIGN.md.
type AdobeProvider = ReturnType<typeof fontProviders.adobe>;

function adobe(config: { id: string }): AdobeProvider {
  const provider = fontProviders.adobe(config);
  return {
    ...provider,
    async resolveFont(options) {
      const resolved = await provider.resolveFont(options);
      if (!resolved) return resolved;
      return {
        fonts: resolved.fonts.map(({ display: _display, ...face }) => face),
      };
    },
  };
}

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
  ],

  image: {
    responsiveStyles: true,
  },

  fonts: [
    {
      name: 'Irregardless Variable',
      provider: adobe({ id: 'ulk1nsi' }),
      cssVariable: '--font-irregardless',
      weights: ['300 800'],
      styles: ['normal'],
      display: 'swap',
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      name: 'Polymath Text',
      provider: adobe({ id: 'ulk1nsi' }),
      cssVariable: '--font-polymath',
      weights: [400, 700],
      styles: ['normal', 'italic'],
      display: 'swap',
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],

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
