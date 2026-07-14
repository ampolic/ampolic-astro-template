/**
 * Generate public/apple-touch-icon.png (180x180) from public/favicon.svg.
 * iOS ignores transparency and squares/rounds the icon itself, so we render the
 * mark onto a SOLID brand-surface background (--color-surface, light). Re-run this
 * whenever the client logo (favicon.svg) or surface token changes:
 *   node scripts/gen-apple-touch-icon.mjs
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const SIZE = 180;
const MARK = 118; // mark box inside the padded square
const BG = { r: 0xfa, g: 0xfb, b: 0xfb, alpha: 1 }; // #fafbfb = --color-surface (light)

const svg = readFileSync(new URL('../public/favicon.svg', import.meta.url));

// Rasterise the SVG mark on a transparent canvas (high density for crisp edges).
// The SVG's embedded prefers-color-scheme has no match headless, so the light
// default (#000 mark) is used — correct over the light surface background.
const mark = await sharp(svg, { density: 512 })
  .resize(MARK, MARK, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();

await sharp({ create: { width: SIZE, height: SIZE, channels: 4, background: BG } })
  .composite([{ input: mark, gravity: 'center' }])
  .png()
  .toFile(new URL('../public/apple-touch-icon.png', import.meta.url).pathname);

console.log(`apple-touch-icon.png written (${SIZE}x${SIZE}, bg #fafbfb)`);
