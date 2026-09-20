import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '~/site';

// Generated, like llms.txt, so the sitemap cannot name a second host.
export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL(SITE_ORIGIN);

  const body = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${new URL('/sitemap-index.xml', origin).href}`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
