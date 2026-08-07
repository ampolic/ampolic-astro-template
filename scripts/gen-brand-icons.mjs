#!/usr/bin/env node
/** Generate favicon, Apple touch icon, and default OG assets from a client logo.
 *
 * Values are explicit arguments so this reusable script never duplicates site
 * facts or brand tokens. Copy them from src/config/site.ts and the @theme block:
 *
 * node scripts/gen-brand-icons.mjs \
 *   --logo src/assets/images/client-logo.png --name "Client Name" \
 *   --tagline "Client tagline" --surface "#ffffff" \
 *   --scrim "#111827" --accent "#2563eb"
 */
import { parseArgs } from "node:util";
import { resolve } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const { values } = parseArgs({
  options: {
    logo: { type: "string" },
    name: { type: "string" },
    tagline: { type: "string" },
    surface: { type: "string" },
    scrim: { type: "string" },
    accent: { type: "string" },
    output: { type: "string", default: "public" },
  },
});

const required = ["logo", "name", "surface", "scrim", "accent"];
const missing = required.filter((key) => !values[key]);
if (missing.length) {
  throw new Error(
    `Missing required options: ${missing.map((key) => `--${key}`).join(", ")}`,
  );
}

const rgb = (hex) => {
  const value = hex.replace(/^#/, "");
  const full =
    value.length === 3 ? [...value].map((c) => c + c).join("") : value;
  if (!/^[\da-f]{6}$/i.test(full))
    throw new Error(`Expected a hex color, received: ${hex}`);
  return {
    r: Number.parseInt(full.slice(0, 2), 16),
    g: Number.parseInt(full.slice(2, 4), 16),
    b: Number.parseInt(full.slice(4, 6), 16),
    alpha: 1,
  };
};
const xml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
const logoPath = resolve(values.logo);
const outputDir = resolve(values.output);
const out = (file) => resolve(outputDir, file);
mkdirSync(outputDir, { recursive: true });

// Read before writing so public/favicon.svg can itself be used as the source.
const logo = await sharp(logoPath).png().toBuffer();

const png64 = await sharp(logo)
  .resize(64, 64, { fit: "contain" })
  .png()
  .toBuffer();
writeFileSync(
  out("favicon.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><image width="64" height="64" href="data:image/png;base64,${png64.toString("base64")}"/></svg>\n`,
);

const png32 = await sharp(logo)
  .resize(32, 32, { fit: "contain" })
  .png()
  .toBuffer();
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);
icoHeader[6] = 32;
icoHeader[7] = 32;
icoHeader.writeUInt16LE(1, 10);
icoHeader.writeUInt16LE(32, 12);
icoHeader.writeUInt32LE(png32.length, 14);
icoHeader.writeUInt32LE(22, 18);
writeFileSync(out("favicon.ico"), Buffer.concat([icoHeader, png32]));

const touchLogo = await sharp(logo)
  .resize(140, 140, { fit: "contain" })
  .png()
  .toBuffer();
await sharp({
  create: {
    width: 180,
    height: 180,
    channels: 4,
    background: rgb(values.surface),
  },
})
  .composite([{ input: touchLogo, gravity: "center" }])
  .png()
  .toFile(out("apple-touch-icon.png"));

const ogLogo = await sharp(logo)
  .resize(220, 220, { fit: "contain" })
  .png()
  .toBuffer();
const text =
  Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <text x="600" y="440" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="64" font-weight="bold" fill="#ffffff">${xml(values.name)}</text>
  <text x="600" y="505" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="30" fill="${values.accent}">${xml(values.tagline)}</text>
</svg>`);
await sharp({
  create: {
    width: 1200,
    height: 630,
    channels: 4,
    background: rgb(values.scrim),
  },
})
  .composite([
    { input: ogLogo, top: 120, left: 490 },
    { input: text, top: 0, left: 0 },
  ])
  .png()
  .toFile(out("og-default.png"));

console.log(`Brand assets written to ${outputDir}`);
