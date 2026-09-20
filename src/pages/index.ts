import type { APIRoute } from 'astro';
import { localizePath, negotiateLocale } from '~/i18n';

/* The one on-demand route: the edition depends on the request header. */
export const prerender = false;

export const GET: APIRoute = ({ request }) => {
  const locale = negotiateLocale(request.headers.get('accept-language'));

  return new Response(null, {
    status: 302,
    headers: {
      location: localizePath('/', locale),
      /* The answer depends on the request header, so caches must key on it. */
      vary: 'Accept-Language',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
};
