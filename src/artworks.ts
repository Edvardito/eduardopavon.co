import type { ImageMetadata } from 'astro';
import placeholders from './assets/artworks/placeholders.json';
import { getCollection, type CollectionEntry } from 'astro:content';
import { resolveLocalized, t, type Locale } from '~/i18n';

export type Artwork = CollectionEntry<'artworks'>;

/* Paired by slug, so no work ships half-configured. Lazy: eager walks every
 * 3000px derivative on each dev start. `~/` does not apply inside a glob. */
const DETAIL_ASSETS = import.meta.glob<{ default: ImageMetadata }>(
  './assets/artworks/detail/*.webp',
);

export async function getSortedArtworks(): Promise<Artwork[]> {
  return (await getCollection('artworks')).sort((a, b) => a.data.order - b.data.order);
}

/** The work that opens the gallery, and represents the site in link previews. */
export async function getFeaturedArtwork(): Promise<Artwork> {
  const [featured] = await getSortedArtworks();
  if (!featured) throw new Error('The artworks collection is empty.');
  return featured;
}

export async function detailImage(artwork: Artwork): Promise<ImageMetadata | undefined> {
  const load = DETAIL_ASSETS[`./assets/artworks/detail/${artwork.id}.webp`];
  return load ? (await load()).default : undefined;
}

export function placeholderFor(artwork: Artwork): string | undefined {
  return (placeholders as Record<string, string>)[artwork.id];
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
