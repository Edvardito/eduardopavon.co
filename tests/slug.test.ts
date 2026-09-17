import { describe, expect, it } from 'vitest';
import { slugFromOriginalName, slugify } from '../scripts/optimize-images.mjs';

describe('slugify', () => {
  it('strips diacritics and lowercases', () => {
    expect(slugify('Crisálida')).toBe('crisalida');
    expect(slugify('Sin título')).toBe('sin-titulo');
  });

  it('collapses punctuation into single hyphens', () => {
    expect(slugify('Retazos (serie)')).toBe('retazos-serie');
  });
});

describe('slugFromOriginalName', () => {
  const cases: Array<[string, string]> = [
    ['Billete falso-Pluma bic sobre papel-25.5 x 37 cm-2023-Enmarcada.jpg', 'billete-falso'],
    [
      'Crisálida-Pluma bic sobre lona plástica-28.34 in (H) x 24.41 in (W)- 2021-VENDIDA.jpg',
      'crisalida',
    ],
    ['Desilusión - Pluma bic sobre papel - 60x90 cm - 2026- VENDIDA.jpg', 'desilusion'],
    ['Retazos (serie) - Pluma bic sobre papel bond - 21.6 x 27.9 cm - 2026.png', 'retazos-serie'],
    ['Sin título - Pluma bic sobre papel -  28.34 in (H) x 31.3 in (W) - 2021.jpg', 'sin-titulo'],
  ];

  it.each(cases)('derives the slug from %s', (filename, expected) => {
    expect(slugFromOriginalName(filename)).toBe(expected);
  });
});
