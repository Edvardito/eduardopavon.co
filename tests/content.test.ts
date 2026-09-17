import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'yaml';
import { beforeAll, describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE, LOCALES } from '~/i18n/config';
import { ARTWORK_STATUSES } from '~/site';
import { MAX_COMMITTED_BYTES } from '../scripts/optimize-images.mjs';

const CONTENT_DIR = path.resolve('src/content/artworks');
const ASSET_DIR = path.resolve('src/assets/artworks');

interface Artwork {
  slug: string;
  title: Record<string, string>;
  medium: Record<string, string>;
  alt?: Record<string, string>;
  dimensions: { width: number; height: number; unit: 'cm' | 'in' };
  year: number;
  status: 'framed' | 'sold' | null;
  order: number;
  image: string;
}

let artworks: Artwork[];

beforeAll(async () => {
  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.yaml'));
  artworks = await Promise.all(
    files.map(async (file) => ({
      slug: path.basename(file, '.yaml'),
      ...parse(await readFile(path.join(CONTENT_DIR, file), 'utf8')),
    })),
  );
});

describe('artwork collection', () => {
  it('has entries', () => {
    expect(artworks.length).toBeGreaterThan(0);
  });

  it('gives every entry a unique gallery order', () => {
    const orders = artworks.map((a) => a.order);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it('references an image that matches the entry slug', () => {
    for (const artwork of artworks) {
      expect(artwork.image).toBe(`~/assets/artworks/${artwork.slug}.webp`);
    }
  });

  it('translates every localized field into at least the default locale', () => {
    for (const artwork of artworks) {
      for (const field of ['title', 'medium', 'alt'] as const) {
        const value = artwork[field];
        if (!value) continue;
        expect(value[DEFAULT_LOCALE], `${artwork.slug}.${field}`).toBeTruthy();
        for (const locale of Object.keys(value)) {
          expect(LOCALES as readonly string[], `${artwork.slug}.${field}`).toContain(locale);
        }
      }
    }
  });

  it('uses a known status value', () => {
    for (const artwork of artworks) {
      expect([null, ...ARTWORK_STATUSES]).toContain(artwork.status ?? null);
    }
  });
});

describe('artwork images', () => {
  it('has a committed asset for every entry, under the size budget', async () => {
    for (const artwork of artworks) {
      const file = path.join(ASSET_DIR, `${artwork.slug}.webp`);
      const { size } = await stat(file);
      expect(size, `${artwork.slug} exceeds the 1 MB budget`).toBeLessThan(MAX_COMMITTED_BYTES);
    }
  });

  it('has no orphaned assets', async () => {
    const assets = (await readdir(ASSET_DIR)).map((f) => path.basename(f, '.webp'));
    expect(assets.sort()).toEqual(artworks.map((a) => a.slug).sort());
  });

  // The Phase 1 regression: source filenames mixed "width x height" and
  // "height x width", so a swapped pair silently published wrong dimensions.
  // A swap flips the ratio, which this catches.
  it('records dimensions in the same orientation as the image', async () => {
    for (const artwork of artworks) {
      const { width = 0, height = 0 } = await sharp(
        path.join(ASSET_DIR, `${artwork.slug}.webp`),
      ).metadata();

      const imageRatio = width / height;
      const recordedRatio = artwork.dimensions.width / artwork.dimensions.height;
      const swappedRatio = artwork.dimensions.height / artwork.dimensions.width;

      const recordedError = Math.abs(recordedRatio - imageRatio);
      const swappedError = Math.abs(swappedRatio - imageRatio);

      expect(
        recordedError,
        `${artwork.slug}: dimensions look swapped — recorded ${artwork.dimensions.width}×${artwork.dimensions.height} ` +
          `(ratio ${recordedRatio.toFixed(3)}) vs image ratio ${imageRatio.toFixed(3)}`,
      ).toBeLessThanOrEqual(swappedError);
    }
  });
});
