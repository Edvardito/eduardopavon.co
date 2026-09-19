/** Public/professional name, used for display and credit. */
export const ARTIST_NAME = 'Eduardo Pavón';

/** Legal name, used in copyright and licensing statements. */
export const ARTIST_LEGAL_NAME = 'José Eduardo Hernández Pavón';

export const ARTWORK_LICENSE = {
  id: 'CC BY-NC-ND 4.0',
  name: 'Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International',
  url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/',
} as const;

/** Credit for the site itself — distinct from the authorship of the work. */
export const SITE_AUTHOR = {
  name: 'Eduardo Aire Torres',
  url: 'https://github.com/eduairet',
} as const;

export const ARTWORK_STATUSES = ['framed', 'sold'] as const;

export type ArtworkStatus = (typeof ARTWORK_STATUSES)[number];

export function copyrightNotice(year?: number): string {
  return `© ${year ? `${year} ` : ''}${ARTIST_LEGAL_NAME}`;
}

export function rightsStatement(year?: number): string {
  return `${copyrightNotice(year)} — ${ARTWORK_LICENSE.id}`;
}
