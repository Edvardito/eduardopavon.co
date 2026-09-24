#!/usr/bin/env node
/**
 * Derives the favicon set from sin-titulo's detail tier into public/.
 *
 * docker compose run --rm web pnpm icons
 */

import { Buffer } from 'node:buffer';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { PROJECT_ROOT, TIERS, outputDir } from './optimize-images.mjs';

const DETAIL = TIERS.find((tier) => tier.label === 'detail');
const SOURCE = path.join(outputDir(DETAIL), 'sin-titulo.webp');
const PUBLIC = path.join(PROJECT_ROOT, 'public');

// The head and headphones; every value, cy included, is a fraction of the width.
const FRAME = { cx: 0.44841, cy: 0.39004, side: 0.47005 };

const APPLE_TOUCH_INSET = 20;
const MASKABLE_SAFE_ZONE = 0.8;

const ICONS = [
  {
    file: 'apple-touch-icon.png',
    size: 180,
    frameShare: (180 - 2 * APPLE_TOUCH_INSET) / 180,
  },
  { file: 'icon-192.png', size: 192, frameShare: 1 },
  { file: 'icon-512.png', size: 512, frameShare: 1 },
  { file: 'icon-maskable-512.png', size: 512, frameShare: MASKABLE_SAFE_ZONE },
];
const ICO_SIZES = [16, 32, 48];

const { data, info } = await sharp(SOURCE).raw().toBuffer({ resolveWithObject: true });
const { width, height } = info;

function render(size, frameShare = 1) {
  const side = Math.round((FRAME.side * width) / frameShare);
  const left = Math.round(FRAME.cx * width - side / 2);
  const top = Math.round(FRAME.cy * width - side / 2);
  if (left < 0 || top < 0 || left + side > width || top + side > height) {
    throw new Error(`Frame ${side}px at ${left},${top} leaves the ${width}x${height} source`);
  }
  return sharp(data, { raw: info })
    .extract({ left, top, width: side, height: side })
    .resize(size, size, { kernel: 'lanczos3' })
    .removeAlpha()
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toBuffer();
}

function encodePngIco(images) {
  const header = Buffer.alloc(6 + 16 * images.length);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = header.length;
  images.forEach(({ size, png }, i) => {
    const entry = 6 + 16 * i;
    header.writeUInt8(size, entry);
    header.writeUInt8(size, entry + 1);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(png.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += png.length;
  });
  return Buffer.concat([header, ...images.map(({ png }) => png)]);
}

const outputs = [
  ...ICONS.map(async ({ file, size, frameShare }) => [file, await render(size, frameShare)]),
  (async () => [
    'favicon.ico',
    encodePngIco(
      await Promise.all(ICO_SIZES.map(async (size) => ({ size, png: await render(size) }))),
    ),
  ])(),
];

for (const [file, bytes] of await Promise.all(outputs)) {
  await writeFile(path.join(PUBLIC, file), bytes);
  console.log(`${file}  ${(bytes.length / 1024).toFixed(1)} KB`);
}
