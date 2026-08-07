import type { ImageMetadata } from "astro";

/**
 * Sveltia stores CMS-selected images as absolute repository paths, while
 * hand-authored Astro content may already contain image() metadata. Resolve
 * either representation to an astro:assets-compatible image and fail the
 * build when an absolute CMS path is broken.
 */
const assets = import.meta.glob<{ default: ImageMetadata }>(
  "/src/assets/images/**/*.{jpg,jpeg,png,webp,avif,gif,svg}",
  { eager: true },
);

export type ContentImage = ImageMetadata | string;

export function resolveContentImage(
  image: ContentImage | undefined,
  context: string,
): ImageMetadata | undefined {
  if (!image) return undefined;
  if (typeof image !== "string") return image as ImageMetadata;
  const mod = assets[image];
  if (!mod) throw new Error(`${context}: image not found: ${image}`);
  return mod.default;
}
