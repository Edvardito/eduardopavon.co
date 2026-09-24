import type { APIRoute } from 'astro';
import { ARTIST_NAME } from '~/site';

export const GET: APIRoute = () => {
  const manifest = {
    id: '/',
    name: ARTIST_NAME,
    start_url: '/',
    display: 'browser',
    icons: [
      { src: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { src: '/icon-512.png', type: 'image/png', sizes: '512x512' },
      { src: '/icon-maskable-512.png', type: 'image/png', sizes: '512x512', purpose: 'maskable' },
    ],
  };

  return new Response(JSON.stringify(manifest), {
    headers: { 'content-type': 'application/manifest+json' },
  });
};
