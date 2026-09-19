import type { APIRoute } from 'astro';
import { getSortedArtworks } from '~/artworks';
import { DEFAULT_LOCALE, formatDimensions, resolveLocalized, statusLabel, t } from '~/i18n';
import { ARTIST_LEGAL_NAME, ARTIST_NAME, ARTWORK_LICENSE, rightsStatement } from '~/site';

/* Generated from the collection rather than written by hand, so it cannot
 * drift from the gallery the way a committed copy would. */
export const GET: APIRoute = async ({ site }) => {
  const locale = DEFAULT_LOCALE;
  const artworks = await getSortedArtworks();
  const origin = site ?? new URL('https://eduardopavon.com');

  const work = artworks.map((artwork) => {
    const { title, medium, dimensions, year, status } = artwork.data;
    const parts = [
      resolveLocalized(medium, locale),
      formatDimensions(dimensions, locale),
      String(year),
    ];
    if (status) parts.push(statusLabel(status, locale));
    return `- ${resolveLocalized(title, locale)} — ${parts.join(' · ')}`;
  });

  const body = `# ${ARTIST_NAME}

> ${t(locale, 'site.description')}

${ARTIST_NAME} (${ARTIST_LEGAL_NAME}) draws with Bic ballpoint pens on paper and
plastic canvas. This site is his portfolio: a catalogue of original works for
galleries, curators, collectors and press. It is a content site — there is
nothing to buy, book or submit here.

Site language: Spanish (${locale}). Canonical origin: ${origin.origin}

## Work

${work.join('\n')}

## Pages

- [Gallery](${origin.origin}/): every work in sequence, with full catalogue data.
- [Sitemap](${new URL('/sitemap-index.xml', origin).href})

## Licensing

The artwork is **not** covered by the site's source licence, and this matters
for reuse:

- Artwork and reproductions: ${ARTWORK_LICENSE.name} (${ARTWORK_LICENSE.id}) — ${ARTWORK_LICENSE.url}
  Share with attribution to "${ARTIST_NAME}"; no commercial use, no derivatives.
- Source code: MIT.
- ${rightsStatement()}

Reproducing an image commercially, or publishing a cropped or altered version,
requires the artist's written permission.
`;

  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
};
