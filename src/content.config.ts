import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { DEFAULT_LOCALE, LOCALES, isLocale } from '~/i18n/config';
import { ARTWORK_STATUSES } from '~/site';

// Open map, so adding a locale never edits this schema.
const localizedString = () =>
  z
    .record(z.string(), z.string().min(1))
    .refine((value) => typeof value[DEFAULT_LOCALE] === 'string', {
      message: `must include the default locale "${DEFAULT_LOCALE}"`,
    })
    .refine((value) => Object.keys(value).every(isLocale), {
      message: `locale keys must be one of: ${LOCALES.join(', ')}`,
    });

const artworks = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/artworks' }),
  schema: ({ image }) =>
    z.object({
      title: localizedString(),
      medium: localizedString(),
      alt: localizedString().optional(),

      dimensions: z.object({
        width: z.number().positive(),
        height: z.number().positive(),
        unit: z.enum(['cm', 'in']),
      }),
      year: z.number().int().min(1900).max(2100),
      status: z.enum(ARTWORK_STATUSES).nullable().default(null),
      order: z.number().int().min(0),
      image: image(),
    }),
});

export const collections = { artworks };
