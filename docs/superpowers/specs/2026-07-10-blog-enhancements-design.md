# Blog Enhancements — Design

**Date:** 2026-07-10
**Status:** Approved (pending spec review)

## Goal

Raise the blog from a basic post list to a long-tail-SEO, share-ready reading
experience, without breaking the template contract: all visual identity in
`@theme`, all business facts in `site.ts`, tokens-only in components/pages (no
hex), new content = one markdown/MDX file, components ≤ 80 lines, `pnpm check`
+ `pnpm build` clean.

Four features on a shared foundation:

1. Tag index pages (`/blog/tags/…`) — internal linking + long-tail SEO.
2. Draft preview + scheduled posts — filter `draft` and future `date`.
3. Prose typographic polish + reading blocks — richer `Prose`, `Callout`,
   prev/next, related posts.
4. Auto OG images — branded 1200×630 social card per post at build time
   (satori + resvg).

## Non-goals (YAGNI)

- Pagination on the blog index or tag pages (post counts are small).
- Tag hierarchies, tag descriptions, or per-tag OG cards.
- Author profiles / multi-author support.
- Comments, search, or reactions.
- Runtime/on-demand OG generation — all OG images are built statically.

---

## 0. Shared foundation — `src/lib/posts.ts`

The draft filter is currently copy-pasted in `blog/index.astro` and
`rss.xml.ts`. Centralize all post querying here so index, RSS, tag pages, and
the slug page share one source of truth. This is an in-scope DRY improvement,
not unrelated refactoring — the new features all need these queries.

### Interface

```ts
// A published post as returned by getCollection('posts')
type Post = CollectionEntry<'posts'>;

// Newest-first, filtered. In dev (import.meta.env.DEV) drafts and future-dated
// posts ARE included so authors can preview; in prod builds they are removed.
export async function getPublishedPosts(): Promise<Post[]>;

// Tag → slug → count, sorted by count desc then name. Uses only published posts.
export function getAllTags(posts: Post[]): { tag: string; slug: string; count: number }[];

// URL-safe slug for a tag display name. "Heat Pumps" -> "heat-pumps".
export function slugifyTag(tag: string): string;

// Posts carrying a given tag (matched by slug), newest-first.
export function postsForTagSlug(posts: Post[], slug: string): Post[];

// Up to n related: score by shared-tag count desc, tie-break newest;
// fill remaining slots with most-recent non-self posts. Never returns self.
export function getRelatedPosts(post: Post, all: Post[], n?: number): Post[];

// Adjacency in the published, date-sorted list.
export function getAdjacentPosts(post: Post, all: Post[]): { prev: Post | null; next: Post | null };
```

### Draft / scheduled semantics

`getPublishedPosts()` is the single gate:

- **Draft:** `data.draft === true` → hidden in prod, shown in dev.
- **Scheduled:** `data.date.getTime() > Date.now()` → hidden in prod, shown in dev.
- Everything downstream (index, RSS, tags, related, prev/next, OG paths) reads
  from this function, so a future-dated or draft post is consistently absent
  from production and consistently present in `pnpm dev`.

Publishing a queued post = its `date` passes (or `draft` flips) + a rebuild.
No code change; satisfies the "new content = one file" contract.

`getStaticPaths` in `blog/[...slug].astro`, the tag pages, and the OG endpoint
all iterate `getPublishedPosts()`, so drafts/future posts produce no routes in
prod and previewable routes in dev.

### Tests (`test/posts.test.ts`)

Pure functions tested with fixture post objects (no content collection needed):

- `slugifyTag` — spaces, casing, punctuation, unicode-ish edge cases.
- `getAllTags` — counts, sort order, dedupe across posts.
- `postsForTagSlug` — slug match, ordering.
- `getRelatedPosts` — shared-tag ranking, recent fallback fill, excludes self,
  respects `n`.
- `getAdjacentPosts` — first/last boundaries return null correctly.

`getPublishedPosts` (dev/prod branch) is exercised via build assertions rather
than unit-mocking `import.meta.env`.

---

## 1. Tag pages

- **`src/pages/blog/tags/[tag].astro`** — `getStaticPaths` maps each tag slug
  (from `getAllTags`) to a page listing that tag's posts. Reuses the blog-index
  post-row markup. One H1 (`Posts tagged "<display name>"`). Canonical +
  description meta for SEO.
- **`src/pages/blog/tags/index.astro`** — overview of all tags with post counts,
  each linking to its tag page. One H1. Improves internal linking + gives
  crawlers a hub.
- **`src/components/TagList.astro`** — reusable token-styled chip row; each chip
  links to `/blog/tags/<slug>`. Rendered on:
  - each blog-index post row,
  - each tag-index and tag page context where useful,
  - the post header in `blog/[...slug].astro`.
- **`blog/index.astro`** gains a compact link/section to browse by tag.

Slug ↔ display-name mapping lives entirely in `posts.ts`; pages never
re-implement slug logic.

---

## 2. Prose polish + reading blocks

### `Prose.astro` (upgraded)

From the current single wrapper `<div>` to a full typographic system, styled in
a scoped `<style>` block that references design tokens via `var(--…)` — **no
hex, no hardcoded radius/shadow**. Covers:

- headings (h2/h3 scroll-margin as today), paragraphs, links,
- **branded blockquotes** (brand left-border, larger/looser text),
- `figure` / `figcaption` (centered caption, muted, small),
- **inline code** and **fenced code blocks** (JetBrains Mono token, surface-alt
  background, `--radius` token, horizontal scroll on overflow),
- lists (ul/ol), `hr`, and basic `table` styling.

Constraint: component stays ≤ 80 lines. If the code-block rules push it over,
they move to a `.prose` layer in `global.css` (still token-only); `Prose.astro`
then just applies `class="prose"`. Decision made at implementation based on
final line count; either way tokens-only holds.

### `Callout.astro`

`<Callout type="tip" | "note" | "warning">` — token-styled variant box with a
lucide icon (via astro-icon), a heading label, and slotted body. Manually
imported at the top of any `.mdx` post that uses it (MDX is already installed).
One example callout added to a seed post to demonstrate + visually verify.

### `PostNav.astro`

Prev/next navigation at the article foot, driven by `getAdjacentPosts`. Renders
nothing for absent neighbors (first/last post).

### `RelatedPosts.astro`

Up to 3 related-post cards at the article foot, driven by `getRelatedPosts`
(shared-tags → recent fallback). Hidden if there are no other posts.

### Wiring

`blog/[...slug].astro` renders, below `<Content />`: `PostNav`, then
`RelatedPosts`. `TagList` is added to the post header. All within existing
layout + spacing tokens.

---

## 3. Auto OG images (satori + resvg)

Build-time branded social card per post. **Build-time only — zero client JS.**

- **`src/pages/og/[slug].png.ts`** — endpoint with `getStaticPaths` over
  `getPublishedPosts()`. For each post: Satori renders a 1200×630 layout (post
  title, brand mark/name, and accent from tokens) to SVG; `@resvg/resvg-js`
  rasterizes to PNG; endpoint returns the PNG buffer. Static output → files
  emitted at build.
- **Font (resolved):** vendor one OFL-licensed **Archivo `.ttf`** into
  `src/assets/og/` (the display typeface), read as a buffer at build and handed
  to Satori. Used only for OG rendering; never served to the browser, so the
  "Fontsource-only / no external fonts" rule (which governs served site fonts)
  is not violated. IMAGE-CREDITS / font license note added.
- **Colors (resolved):** add a small `og: { bg, fg, brand }` block to
  `site.ts` (three literal values) since Satori needs concrete colors and the
  identity otherwise lives in CSS `@theme`. Documented "keep in sync with
  `@theme`." Chosen over regex-parsing `global.css`, which is brittle.
- **Head wiring:** the post `<head>` (via the existing SEO component) emits
  `og:image`, `og:image:width/height`, and `twitter:image` + `twitter:card`
  pointing at the absolute URL of `/og/<slug>.png`. `twitter:card` =
  `summary_large_image`.

### Dependencies added

- `satori` — devDependency (build-time SVG generation).
- `@resvg/resvg-js` — devDependency (build-time PNG rasterization).

Both build-time only. No runtime/client dependency; client JS budget unchanged.
(Approved deviation from PLAN §0 dependency list — user granted explicitly.)

---

## Data model / config changes

- `postSchema` — no change required (`tags`, `draft`, `date`, `updated` already
  present).
- `site.ts` — add `og: { bg, fg, brand }` palette block.
- `src/assets/og/*.ttf` — vendored Archivo static font (build-time OG only).
- `docs/IMAGE-CREDITS.md` — record the OG font license/source.

## Files

**New:**
- `src/lib/posts.ts`
- `src/pages/blog/tags/[tag].astro`
- `src/pages/blog/tags/index.astro`
- `src/pages/og/[slug].png.ts`
- `src/components/TagList.astro`
- `src/components/Callout.astro`
- `src/components/PostNav.astro`
- `src/components/RelatedPosts.astro`
- `src/assets/og/archivo.ttf` (vendored)
- `test/posts.test.ts`

**Modified:**
- `src/components/Prose.astro`
- `src/pages/blog/index.astro`
- `src/pages/blog/[...slug].astro`
- `src/pages/rss.xml.ts` (use `getPublishedPosts`)
- `src/config/site.ts` (add `og` block)
- the SEO/head component (add og:image/twitter meta for posts)
- `docs/IMAGE-CREDITS.md`
- possibly `src/styles/global.css` (`.prose` layer, only if Prose exceeds 80 lines)

## Testing & Definition of Done

- `test/posts.test.ts` green (helper units).
- `pnpm check` clean; `pnpm build` zero warnings; build emits tag pages under
  `/blog/tags/` and PNGs under `/og/`.
- No hex in `src/components` / `src/pages` (grep verify).
- Client JS budget unchanged (< 60KB gzipped) — OG deps are build-time only.
- `prefers-reduced-motion` / no-JS behavior unaffected.
- Visual verification (Playwright per CLAUDE.md) at 1440px + 375px on: a post
  page (Prose + Callout + PostNav + RelatedPosts), a tag page, the tag index;
  plus open one generated `/og/<slug>.png` and eyeball the card against DESIGN.

## Sequencing

Foundation (`posts.ts` + tests) → tag pages → Prose/Callout/PostNav/Related →
OG images last (highest technical risk: font + rasterization). Each stage keeps
`pnpm check`/`build` green before moving on.
