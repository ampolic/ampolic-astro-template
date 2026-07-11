# astro-business-starter — agent rules

Reusable static template for small-business websites. Clean, fast, professional.
The build plan is at docs/PLAN.md — follow it; do not substitute stack choices.

## Stack (non-negotiable)
- Astro 5, static output. Tailwind CSS v4 via @tailwindcss/vite ONLY —
  never @astrojs/tailwind, never tailwind.config.js (CSS-first @theme).
- No React/Vue/Svelte. Pure .astro components only.
- Animation: GSAP + Lenis only, and only via src/scripts/motion.ts.
- Fonts: Fontsource variable packages only. No Google Fonts CDN, no external fonts.
- Package manager: pnpm. Docs lookups: consult Context7 before writing any
  Tailwind v4 or Astro 5 config — do not rely on memory for these APIs.

## Theming discipline (the core contract of this template)
- ALL visual identity lives in the @theme block of src/styles/global.css
  and the font imports in Base.astro. Nothing else.
- Components reference design tokens only. NEVER hardcode hex colors,
  border-radius values, or shadows in components or pages.
- One brand color (--color-brand). Neutrals carry the rest.
- Reference tokens with the paren shorthand: `py-(--spacing-section)`, `rounded-(--radius-base)` — the `[--token]` bracket form is invalid in Tailwind v4 (compiles without `var()`, silently no-ops).
- All business facts (name, contact, hours, nav, socials, form endpoint,
  analytics) live in src/config/site.ts. Never inline them in components.

## Design quality bar (aesthetic direction comes from the frontend-design
## skill per client; these floors always apply)
- One H1 per page. Body text 16–18px, line-height ≥ 1.6, measure ≤ 70ch.
- Section rhythm: --spacing-section padding, alternating surface/surface-alt.
- Exactly one primary CTA style per page; conversion path obvious.
- WCAG AA contrast, visible focus states, 44px tap targets.
- Motion: subtle, enter-only, ≤ 0.6s. No pinning or scroll-jacking.
- prefers-reduced-motion fully honored; site must be complete with JS disabled
  (nav, FAQ accordion, and form all work without JS).
- Images only via astro:assets <Image /> with explicit dimensions.

## Workflow
- Every component ≤ 80 lines. Prefer composition over prop flags.
- After every batch of edits: run `pnpm check` then `pnpm build`.
  Both must pass before a task is done.
- Adding a service/post/testimonial/FAQ must require only a new markdown
  file — if a code change is needed, the design is wrong; fix the template.
- Do not add dependencies beyond those in docs/PLAN.md §0 without asking.

## Definition of done (per PLAN.md §9)
- astro check clean; build zero warnings
- Lighthouse mobile: Perf ≥ 95, A11y ≥ 95, SEO 100
- Client JS < 60KB gzipped
- No hex values in src/components or src/pages (grep to verify)
- Rebrand test passes: site.ts + @theme + font swap = coherent new brand

## Stock images
Use the image-banks MCP (Pexels). Always download into src/assets/images/
(never hotlink), prefer landscape ≥1600px for hero images, portrait for
testimonial/team slots. Record photographer name + Pexels URL in
docs/IMAGE-CREDITS.md. Serve only via astro:assets <Image /> with explicit
dimensions.

## Visual verification (mandatory for any UI change)
After any change affecting rendering: start `pnpm dev`, use Playwright MCP to
screenshot the affected pages at 1440px and 375px widths, view the screenshots,
and check them against docs/DESIGN.md before declaring the task done.
Specifically check: section spacing/rhythm, typography scale, contrast,
and anything that reads as a generic template.
