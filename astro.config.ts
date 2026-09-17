import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';
import { DEFAULT_LOCALE, LOCALES, LOCALE_METADATA, PREFIX_DEFAULT_LOCALE } from './src/i18n/config';

const SITE = process.env.SITE_URL ?? 'https://eduardopavon.com';

// Bind-mount file events are unreliable on Windows/macOS hosts; compose sets this.
const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true';

export default defineConfig({
  site: SITE,

  // Static, but with the adapter configured so a future route can opt out
  // via `export const prerender = false` without a global SSR switch.
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

  // Self-hosted at build time: no runtime request to Google, and Astro
  // generates fallback metrics so swapping the webfont in causes no shift.
  fonts: [
    {
      name: 'Urbanist',
      provider: fontProviders.google(),
      cssVariable: '--font-urbanist',
      // Variable range, so every weight below comes from one file.
      weights: ['100 900'],
      styles: ['normal'],
      subsets: ['latin', 'latin-ext'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],

  vite: {
    plugins: [tailwindcss()],
    server: {
      // Polling must skip node_modules: chokidar's `ignored` replaces Vite's
      // defaults, and stat-ing the whole dependency tree stalls startup
      // outright rather than merely slowing it.
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
