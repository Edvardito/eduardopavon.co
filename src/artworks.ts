import { getCollection, type CollectionEntry } from 'astro:content';
import { resolveLocalized, t, type Locale } from '~/i18n';

export type Artwork = CollectionEntry<'artworks'>;

export async function getSortedArtworks(): Promise<Artwork[]> {
  return (await getCollection('artworks')).sort((a, b) => a.data.order - b.data.order);
}

/** The work that represents the site in link previews. */
export async function getFeaturedArtwork(): Promise<Artwork> {
  const [featured] = await getSortedArtworks();
  if (!featured) throw new Error('The artworks collection is empty.');
  return featured;
}

/** Authored alt text when present, otherwise built from the work's own metadata. */
export function artworkAltText(artwork: Artwork, locale: Locale): string {
  const { title, medium, alt } = artwork.data;
  if (alt) return resolveLocalized(alt, locale);
  return t(locale, 'artwork.alt', {
    title: resolveLocalized(title, locale),
    medium: resolveLocalized(medium, locale),
  });
}
