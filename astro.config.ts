import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { DEFAULT_LOCALE, LOCALES, LOCALE_METADATA, PREFIX_DEFAULT_LOCALE } from './src/i18n/config';

const SITE = process.env.SITE_URL ?? 'https://eduardopavon.com';

// Bind-mount file events are unreliable off Linux; compose sets this.
const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true';

/* Split, so a build in a second container cannot cost the dev server a re-scan. */
const cacheRoot = process.env.VITE_CACHE_DIR;
const cacheDir = cacheRoot
  ? `${cacheRoot}/${process.argv.includes('dev') ? 'dev' : 'other'}`
  : undefined;

export default defineConfig({
  site: SITE,

  // Adapter configured so one route can opt out, without global SSR.
  output: 'static',
  adapter: vercel(),

  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: [...LOCALES],
    routing: {
      prefixDefaultLocale: PREFIX_DEFAULT_LOCALE,
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
      provider: fontProviders.adobe({ id: 'ulk1nsi' }),
      cssVariable: '--font-irregardless',
      weights: ['300 800'],
      styles: ['normal'],
      display: 'swap',
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
    {
      name: 'Polymath Text',
      provider: fontProviders.adobe({ id: 'ulk1nsi' }),
      cssVariable: '--font-polymath',
      weights: [400, 700],
      styles: ['normal', 'italic'],
      display: 'swap',
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],

  /* No `fonts` block: Typekit, linked in BaseLayout. DESIGN.md, Typography. */

  vite: {
    ...(cacheDir ? { cacheDir } : {}),
    plugins: [tailwindcss()],
    /* esbuild, not Lightning CSS: Lightning folds `animation-timeline` into the
     * `animation` shorthand, which no browser parses, so a minified build drops
     * every scroll-driven animation. */
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
