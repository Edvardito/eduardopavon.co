#!/usr/bin/env node
/**
 * Imports artwork originals as two WebP tiers plus a blurred placeholder.
 *
 * docker compose --profile tools run --rm images
 */

import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ARTIST_NAME, ARTWORK_LICENSE, rightsStatement } from '../src/site.ts';

const FORMAT = 'webp';
const QUALITY = 82;

/* Small enough to inline, large enough to stand in. */
const PLACEHOLDER_EDGE = 20;
export const PLACEHOLDER_FILE = 'placeholders.json';

export const MAX_COMMITTED_BYTES = 1024 * 1024;
export const MAX_DETAIL_BYTES = 2.5 * 1024 * 1024;

/* 2000: at 2400 the scanned work exceeds 1 MB. 3000: the loupe needs 3.3x. */
export const TIERS = [
  {
    label: 'gallery',
    dir: ['src', 'assets', 'artworks'],
    maxEdge: 2000,
    budget: MAX_COMMITTED_BYTES,
  },
  {
    label: 'detail',
    dir: ['src', 'assets', 'artworks', 'detail'],
    maxEdge: 3000,
    budget: MAX_DETAIL_BYTES,
  },
];

const RIGHTS = rightsStatement();

// Covers the committed masters; astro:assets strips this from what it serves.
const XMP_RIGHTS = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"
    xmlns:cc="http://creativecommons.org/ns#">
   <dc:creator><rdf:Seq><rdf:li>${ARTIST_NAME}</rdf:li></rdf:Seq></dc:creator>
   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${RIGHTS}</rdf:li></rdf:Alt></dc:rights>
   <xmpRights:Marked>True</xmpRights:Marked>
   <xmpRights:WebStatement>${ARTWORK_LICENSE.url}</xmpRights:WebStatement>
   <cc:license rdf:resource="${ARTWORK_LICENSE.url}"/>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="r"?>`;
const SOURCE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.tif', '.tiff', '.webp']);

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = (tier) => path.join(PROJECT_ROOT, ...tier.dir);

function parseArgs(argv) {
  const args = { src: process.env.ARTWORK_SOURCE_DIR ?? '' };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--src') args.src = argv[i + 1] ?? '';
  }
  return args;
}

export function slugify(input) {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Originals are named "<Title>-<Medium>-<Dimensions>-<Year>-<Status>.<ext>". */
export function slugFromOriginalName(filename) {
  const withoutExtension = filename.slice(0, filename.length - path.extname(filename).length);
  const [title] = withoutExtension.split('-');
  return slugify(title.trim());
}

const SOURCE_HELP =
  'Set ARTWORK_ORIGINALS in .env to the folder holding the originals (see .env.example),\n' +
  'then run: docker compose --profile tools run --rm images';

const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function main() {
  const { src } = parseArgs(process.argv.slice(2));

  if (!src) {
    console.error(SOURCE_HELP);
    process.exitCode = 1;
    return;
  }

  const sourceDir = path.resolve(src);
  const entries = (await readdir(sourceDir))
    .filter((name) => SOURCE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort();

  if (entries.length === 0) {
    console.error(`No importable images found in ${sourceDir}.\n${SOURCE_HELP}`);
    process.exitCode = 1;
    return;
  }

  for (const tier of TIERS) {
    await mkdir(outputDir(tier), { recursive: true });
  }

  const seen = new Map();
  const results = [];
  const placeholders = {};

  for (const name of entries) {
    const slug = slugFromOriginalName(name);
    if (seen.has(slug)) {
      throw new Error(`Slug collision: "${name}" and "${seen.get(slug)}" both map to "${slug}".`);
    }
    seen.set(slug, name);

    const sourcePath = path.join(sourceDir, name);
    const sourceBytes = (await stat(sourcePath)).size;
    const { width = 0, height = 0 } = await sharp(sourcePath, { failOn: 'error' }).metadata();

    for (const tier of TIERS) {
      // A sharp pipeline is not reusable once run.
      const buffer = await sharp(sourcePath, { failOn: 'error' })
        .rotate()
        .resize({
          width: tier.maxEdge,
          height: tier.maxEdge,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .withExif({ IFD0: { Artist: ARTIST_NAME, Copyright: RIGHTS } })
        .withXmp(XMP_RIGHTS)
        .webp({ quality: QUALITY })
        .toBuffer();

      await writeFile(path.join(outputDir(tier), `${slug}.${FORMAT}`), buffer);
      results.push({ tier, slug, width, height, sourceBytes, outputBytes: buffer.length });

      if (tier.label === 'gallery') {
        const tiny = await sharp(buffer)
          .resize({ width: PLACEHOLDER_EDGE, height: PLACEHOLDER_EDGE, fit: 'inside' })
          .webp({ quality: 40 })
          .toBuffer();
        placeholders[slug] = `url('data:image/webp;base64,${tiny.toString('base64')}')`;
      }
    }
  }

  await writeFile(
    path.join(PROJECT_ROOT, 'src', 'assets', 'artworks', PLACEHOLDER_FILE),
    `${JSON.stringify(placeholders, null, 2)}
`,
  );

  for (const tier of TIERS) {
    const tierResults = results.filter((r) => r.tier === tier);
    console.log(`\n${tierResults.length} image(s) -> ${tier.dir.join('/')}/`);
    console.log(
      `  max edge ${tier.maxEdge}px - ${FORMAT} q${QUALITY} - budget ${formatBytes(tier.budget)}\n`,
    );
    for (const r of tierResults) {
      const saved = (100 - (r.outputBytes / r.sourceBytes) * 100).toFixed(1);
      console.log(
        `  ${r.slug.padEnd(16)} ${String(r.width).padStart(5)}x${String(r.height).padEnd(5)}` +
          ` ${formatBytes(r.sourceBytes).padStart(9)} -> ${formatBytes(r.outputBytes).padStart(9)} (-${saved}%)`,
      );
    }

    const oversized = tierResults.filter((r) => r.outputBytes > tier.budget);
    if (oversized.length > 0) {
      console.warn(
        `\nWarning: ${oversized.map((r) => r.slug).join(', ')} exceeded the ${tier.label} ` +
          `budget of ${formatBytes(tier.budget)}. Lower QUALITY or the tier's maxEdge before committing.`,
      );
    }
  }
}

// Not on import, so the tests can reuse the helpers above.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
