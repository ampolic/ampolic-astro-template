# Blog backfill series — design spec

Backfill the Summit Heating & Air blog with a season-aligned history of posts that
predate the two existing ones (2026-05-14, 2026-06-02), so the blog reads as an
established, regularly-updated resource rather than a two-post stub.

## Scope
- 13 posts, dated 2025-01 through 2026-01, spaced ~monthly and matched to the
  Colorado HVAC season of their month (heating in winter, AC in summer, prep in
  spring/fall).
- Each is a real `.md`/`.mdx` file in `src/content/posts/` with full frontmatter
  and a unique Pexels cover in `src/assets/images/blog-<slug>.webp`.
- All `draft: false` (this is published history, not a forward pipeline).

## Voice & format (match the two existing posts)
- Plain, practical, no-hype; Boulder/Front-Range grounded; ~450–650 words.
- `## ` section headings; a short, low-pressure "next steps" close — no hard sell.
- Full frontmatter: `title`, `description`, `date`, `tags`, `draft: false`, `cover`.
  `updated` on the rebates post (facts date).
- Mix of `.md` and `.mdx`; `Callout` (tip/note/warning) used only where it fits.

## Calendar
| # | Date | Slug | Title | Tags | Format |
|---|------|------|-------|------|--------|
| 1 | 2025-01-20 | furnace-cold-snap | When Your Furnace Can't Keep Up in a Cold Snap | heating, troubleshooting | mdx (warning) |
| 2 | 2025-02-18 | frozen-heat-pump | Frozen Heat Pump? What the Ice Means | heat-pumps, troubleshooting | md |
| 3 | 2025-03-24 | spring-allergies-hvac | Spring Allergies and Your HVAC | air-quality, maintenance | mdx (tip) |
| 4 | 2025-04-14 | merv-ratings | MERV Ratings, Explained | air-quality, buyer-guide | md |
| 5 | 2025-05-19 | upstairs-hotter | Why Your Upstairs Is Always Hotter | comfort, efficiency | md |
| 6 | 2025-06-23 | summer-electric-bill | Straight Talk on Your Summer Electric Bill | efficiency | mdx (note) |
| 7 | 2025-07-21 | ac-warm-air | AC Blowing Warm Air? Check This First | troubleshooting | mdx (warning) |
| 8 | 2025-08-18 | repair-or-replace-ac | Repair or Replace an Aging AC? | buyer-guide | md |
| 9 | 2025-09-15 | furnace-fall-prep | Get Your Furnace Ready Before the First Freeze | heating, maintenance | md |
| 10 | 2025-10-20 | smart-thermostats | Smart Thermostats: Worth It in a Colorado Home? | efficiency, buyer-guide | mdx (tip) |
| 11 | 2025-11-17 | colorado-rebates | HVAC Rebates & Tax Credits in Colorado | financing, efficiency | md (updated 2026-01-12) |
| 12 | 2025-12-15 | winter-dry-air | The Dry-Air Problem: Winter Humidity | air-quality, comfort | mdx (note) |
| 13 | 2026-01-19 | carbon-monoxide-furnace | Carbon Monoxide and Your Furnace | heating, safety | mdx (warning) |

New tags introduced: `troubleshooting`, `comfort`, `safety` — they fill out the
existing tag pages alongside buyer-guide/efficiency/heat-pumps/maintenance/
air-quality/financing.

## Covers
Unique landscape Pexels photo per post, ≥1600px, downloaded to
`src/assets/images/blog-<slug>.webp` and credited in `docs/IMAGE-CREDITS.md`.

## Done when
`pnpm check` clean and `pnpm build` zero warnings; all 13 posts render on the blog
index and their tag pages with covers.
