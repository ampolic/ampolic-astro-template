# Blog Share Menu — Design Spec

**Date:** 2026-07-11
**Component:** `src/components/ShareMenu.astro`
**Goal:** A single "Share" trigger on blog posts that reveals a designed popover of share
options. Works with JavaScript disabled; brand-accurate; theme-token styled; no tracking.

## 1. Scope & principles

- One `ShareMenu.astro` component, placed in the post header of `blog/[...slug].astro`.
- Native HTML popover API for reveal — **no custom open/close JS**.
- Share targets are plain `<a>` intent links (no SDKs, no pixels, no share counts).
- The **only** custom JS: copy-link confirmation and `navigator.share` detection, in one
  tiny inline script.
- All styling via theme tokens — no hardcoded hex, radius, or shadow values.
- Component ≤ 80 lines; pure (takes `title`, `url`, `ogImage` as props).

## 2. Dependency

Add **`@iconify-json/simple-icons`** as a dev dependency:

```
pnpm add -D @iconify-json/simple-icons
```

Rationale: the installed `@iconify-json/lucide` set has no brand marks for X, WhatsApp,
Telegram, Reddit, Pinterest, Bluesky, or Threads (and only the old Twitter bird, not the X
logo). simple-icons is the standard iconify brand-logo set; astro-icon inlines the SVGs at
build time, so there is **zero** client-JS or runtime cost. Approved by the user during
brainstorming (CLAUDE.md requires asking before adding deps).

No `astro.config.mjs` change is needed — astro-icon resolves any installed `@iconify-json/*`
set automatically.

## 3. Config: `shareLinks` in `src/config/site.ts`

Add to the `Site` interface and the `site` object:

```ts
// In Site interface:
/* Which share targets appear on blog posts, in render order. Full menu:
   'native'  — device share sheet (JS only; hidden without navigator.share)
   'copy'    — copy link to clipboard (JS only; hidden without navigator.clipboard)
   'x' | 'facebook' | 'linkedin' | 'bluesky' | 'threads' | 'whatsapp'
   'telegram' | 'reddit' | 'pinterest' | 'email' | 'sms' */
shareLinks: ShareTarget[];
```

```ts
// New exported type:
export type ShareTarget =
  | 'native' | 'copy' | 'x' | 'facebook' | 'linkedin' | 'bluesky'
  | 'threads' | 'whatsapp' | 'telegram' | 'reddit' | 'pinterest'
  | 'email' | 'sms';

// In site object:
shareLinks: ['native', 'copy', 'facebook', 'whatsapp', 'x', 'email'],
```

The component renders **only** the targets present in this array, **in array order**.

## 4. Target definitions

`url` and `title` are URL-encoded with `encodeURIComponent` in every intent link.
`ogImage` (already an absolute URL) is used only by Pinterest.

| target | icon | href / behavior | opens |
|---|---|---|---|
| native | `lucide:share-2` | `navigator.share({title, url})` | JS only |
| copy | `lucide:link` → `lucide:check` | `navigator.clipboard.writeText(url)` | JS only |
| x | `simple-icons:x` | `https://twitter.com/intent/tweet?url={url}&text={title}` | new tab |
| facebook | `simple-icons:facebook` | `https://www.facebook.com/sharer/sharer.php?u={url}` | new tab |
| linkedin | `simple-icons:linkedin` | `https://www.linkedin.com/sharing/share-offsite/?url={url}` | new tab |
| bluesky | `simple-icons:bluesky` | `https://bsky.app/intent/compose?text={title}%20{url}` | new tab |
| threads | `simple-icons:threads` | `https://www.threads.net/intent/post?text={title}%20{url}` | new tab |
| whatsapp | `simple-icons:whatsapp` | `https://wa.me/?text={title}%20{url}` | new tab |
| telegram | `simple-icons:telegram` | `https://t.me/share/url?url={url}&text={title}` | new tab |
| reddit | `simple-icons:reddit` | `https://www.reddit.com/submit?url={url}&title={title}` | new tab |
| pinterest | `simple-icons:pinterest` | `https://pinterest.com/pin/create/button/?url={url}&media={ogImage}&description={title}` | new tab |
| email | `lucide:mail` | `mailto:?subject={title}&body={url}` | mail client |
| sms | `lucide:message-square` | `sms:?body={title}%20{url}` | SMS app |

Note: `%20` in the table means a literal encoded space joining title and url; the space
itself is not double-encoded, but `title` and `url` each are `encodeURIComponent`'d.

Verify exact simple-icons key names after install (`x`, `facebook`, `linkedin`, `bluesky`,
`threads`, `whatsapp`, `telegram`, `reddit`, `pinterest` — all expected to exist).

## 5. Reveal mechanism (native popover, zero-JS)

- **Trigger:** `<button popovertarget="share-panel" aria-haspopup="menu">` styled with the
  existing Button `outline` classes; content = `lucide:share-2` icon + "Share" label.
- **Panel:** `<div id="share-panel" popover="auto">`. `popover="auto"` provides
  light-dismiss (click outside) and Escape-to-close for free — no JS.
- **Positioning:** CSS anchor positioning where supported — trigger gets `anchor-name`, panel
  gets `position-anchor` + `position-area` (open **downward**, right-aligned to the trigger)
  with `position-try-fallbacks` to flip if it would clip. Base fallback (browsers without
  anchor positioning): `position: fixed` centered near the trigger / upper area, constrained
  with `max-width` and `max-height: … ; overflow:auto` so it never overflows the viewport at
  375px.
- **Layout:** options in a 2-column grid (single column when only 1–2 targets); each option
  is a labeled row (icon + network name).

## 6. Styling (tokens only)

- Panel: `bg-surface`, `border border-line`, `rounded-(--radius-base)`, `shadow-card`,
  comfortable padding (e.g. `p-2`/`p-3`), fixed sensible `width`.
- Options: `min-h-11` (44px) tap targets, `rounded-(--radius-base)`, `hover:bg-surface-alt`,
  visible focus (`focus-visible:outline-2 focus-visible:outline-offset-2 outline-brand`).
- Brand icons render in `currentColor` (monochrome) for on-brand consistency, not each
  network's brand color. Icon size ~`size-5`. AA contrast throughout.

## 7. Custom JS (one tiny inline `<script>` — the only JS)

Progressive enhancement, runs on load:

1. **Native:** if `navigator.share` exists, unhide the `native` option (rendered with the
   `hidden` attribute by default) and **move it to the top** of the panel; wire its click to
   `navigator.share({ title, url })`. If absent, it stays hidden — no-JS / unsupported users
   never see a dead button.
2. **Copy:** if `navigator.clipboard?.writeText` exists, unhide the `copy` option (also
   rendered `hidden` by default) and wire it to copy `url`, swapping icon→`check` and
   label→"Copied" for ~1.5s, then reverting. If clipboard is unavailable, `copy` stays
   hidden.

Both `native` and `copy` are **hidden by default** so the no-JS experience shows only the
working intent links.

## 8. URL building (server-side, in `blog/[...slug].astro`)

```ts
const shareUrl = new URL(Astro.url.pathname, Astro.site).href;
const shareOgImage = new URL(`/og/${post.id}.png`, Astro.site).href;
// title = post.data.title
```

`Astro.site` is configured, so `Astro.site` is defined. Pass `title`, `url={shareUrl}`,
`ogImage={shareOgImage}` to `<ShareMenu />`.

## 9. Placement

In the post header, **above the cover image**, to the right of the title. Wrap the existing
`<h1>` and the new `<ShareMenu>` in a flex row:

```astro
<div class="flex items-start justify-between gap-4">
  <h1 class="mt-3 font-display text-4xl font-semibold text-balance">{post.data.title}</h1>
  <ShareMenu title={post.data.title} url={shareUrl} ogImage={shareOgImage} class="mt-3 shrink-0" />
</div>
```

`TagList` and the cover `<Image>` follow unchanged. The popover opens downward from the
trigger. At 375px the trigger stays top-right and shrinks (`shrink-0`); the panel uses the
centered/near-trigger fallback and must not overflow.

## 10. Accessibility & security

- `aria-label` on every option link/button; network links `target="_blank" rel="noopener"`.
- 44px minimum tap targets; visible focus on trigger and every option.
- Trigger `aria-haspopup="menu"`; panel is keyboard-reachable; Escape closes (native).

## 11. Verification (mandatory)

1. `pnpm check && pnpm build` both pass, zero warnings.
2. `pnpm dev` + Playwright at **1440px** and **375px**: screenshot (a) closed state in page
   context, (b) open popover. View both. Check: panel looks designed and on-brand, no
   viewport overflow at 375px, options readable, closed state unobtrusive (just one button
   by the title).
3. Code-audit the no-JS path: popover opens via `popovertarget`; all intent links present
   and correct; `copy`/`native` are `hidden` (absent from the no-JS experience, not broken).
4. Report browser-support notes for the popover API and CSS anchor positioning, and describe
   the fallback experience in older browsers.

## 12. Browser support notes (to confirm during implementation)

- **Popover API:** Baseline (widely available since 2024) across current
  Chrome/Edge/Safari/Firefox. **Decision:** no fallback markup — in pre-2024 browsers without
  support, `popovertarget` is inert and the trigger simply does nothing. This is acceptable
  degradation for a secondary share affordance (the canonical URL is still in the address
  bar). We do **not** ship a visible-by-default static list. Confirm the actual behavior in
  the verification step.
- **CSS anchor positioning:** Chrome/Edge only at time of writing; Safari/Firefox lack it.
  The `position: fixed` centered fallback covers those — anchor positioning is a progressive
  enhancement for exact placement, not a requirement for function.
```

