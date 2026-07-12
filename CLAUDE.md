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

## Privacy discipline
- The privacy policy must stay accurate to what the site ACTUALLY does. Any
  change that adds data collection — analytics, embeds, pixels, new form
  fields, third-party scripts — is a privacy-policy-impacting change: update
  src/pages/privacy.astro in the SAME task, driven by src/config/site.ts `legal`.
- Default stance: no cookies, no analytics, and no third-party browser requests
  beyond the form processor, Cloudflare hosting/Turnstile, and the OpenStreetMap
  embed. Adding any new third-party request requires asking first.
- Never present policy text as legal advice. Keep the "client must review with
  counsel" comment at the bottom of privacy.astro and terms.astro intact.

## Accessibility discipline
- Every UI-affecting task must end with `pnpm test:a11y` passing (zero axe
  violations, every page) IN ADDITION to `pnpm check` && `pnpm build`.
- Any new interactive component ships with keyboard tests in tests/a11y.spec.ts
  covering: reachability (Tab), a visible focus indicator, the expected key
  operation, and escape/close behaviour where applicable. No keyboard test,
  not done.
- Prefer native HTML elements (details, popover, dialog, button) over
  ARIA-recreated widgets. Adding `role=` or `aria-*` to recreate a behaviour a
  native element already provides requires written justification in the diff.
- A Lighthouse accessibility score of 100 is a FLOOR, not proof — it only
  reflects the subset of checks that can be automated. Manual keyboard and
  screen-reader passes (see docs/PRE-LAUNCH-CHECKLIST.md) are still required.
