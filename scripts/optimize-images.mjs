#!/usr/bin/env node
/**
 * Imports artwork originals as slug-named, downscaled WebP under
 * src/assets/artworks/. Originals stay out of the repo.
 *
 *   docker compose --profile tools run --rm images
 */

import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ARTIST_NAME, ARTWORK_LICENSE, rightsStatement } from '../src/site.ts';

// 2000px was chosen empirically: at 2400 the scanned bond-paper work exceeds 1 MB.
const MAX_EDGE = 2000;
const FORMAT = 'webp';
const QUALITY = 82;
export const MAX_COMMITTED_BYTES = 1024 * 1024;

const RIGHTS = rightsStatement();

// Protects the committed masters, which are downloadable from the repo.
// astro:assets re-encodes for delivery and strips this, so the rights markup
// in the page (meta/JSON-LD) is what covers the served images.
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
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'src', 'assets', 'artworks');

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

const formatBytes = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

async function main() {
  const { src } = parseArgs(process.argv.slice(2));

  if (!src) {
    console.error(
      'Missing source folder.\n' +
        '  pnpm images:import --src "<folder with the originals>"\n' +
        'or set ARTWORK_SOURCE_DIR.',
    );
    process.exitCode = 1;
    return;
  }

  const sourceDir = path.resolve(src);
  const entries = (await readdir(sourceDir))
    .filter((name) => SOURCE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .sort();

  if (entries.length === 0) {
    console.error(`No importable images found in ${sourceDir}`);
    process.exitCode = 1;
    return;
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  const seen = new Map();
  const results = [];

  for (const name of entries) {
    const slug = slugFromOriginalName(name);
    if (seen.has(slug)) {
      throw new Error(`Slug collision: "${name}" and "${seen.get(slug)}" both map to "${slug}".`);
    }
    seen.set(slug, name);

    const sourcePath = path.join(sourceDir, name);
    const sourceBytes = (await stat(sourcePath)).size;
    const image = sharp(sourcePath, { failOn: 'error' });
    const { width = 0, height = 0 } = await image.metadata();

    const buffer = await image
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: 'inside', withoutEnlargement: true })
      .withExif({ IFD0: { Artist: ARTIST_NAME, Copyright: RIGHTS } })
      .withXmp(XMP_RIGHTS)
      .webp({ quality: QUALITY })
      .toBuffer();

    await writeFile(path.join(OUTPUT_DIR, `${slug}.${FORMAT}`), buffer);

    results.push({ slug, width, height, sourceBytes, outputBytes: buffer.length });
  }

  console.log(`\nImported ${results.length} artwork image(s)`);
  console.log(`  max edge ${MAX_EDGE}px · ${FORMAT} q${QUALITY} · -> src/assets/artworks/\n`);
  for (const r of results) {
    const saved = (100 - (r.outputBytes / r.sourceBytes) * 100).toFixed(1);
    console.log(
      `  ${r.slug.padEnd(16)} ${String(r.width).padStart(5)}x${String(r.height).padEnd(5)}` +
        ` ${formatBytes(r.sourceBytes).padStart(9)} -> ${formatBytes(r.outputBytes).padStart(9)} (-${saved}%)`,
    );
  }

  const oversized = results.filter((r) => r.outputBytes > MAX_COMMITTED_BYTES);
  if (oversized.length > 0) {
    console.warn(
      `\nWarning: ${oversized.map((r) => r.slug).join(', ')} exceeded 1 MB. ` +
        'Lower QUALITY or MAX_EDGE before committing.',
    );
  }
}

// Only run when invoked directly, so tests can import the helpers above.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
