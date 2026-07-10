# Build Plan: `astro-business-starter`

An opinionated, reusable static site template for small-business websites. Clean, professional, client-themeable. Markdown-first content, deployed to Cloudflare Pages. Visual design direction per project is driven by the frontend-design skill within the guardrails defined here.

This document is written to be executed by a coding agent. Follow it top to bottom. Where a decision is stated, do not substitute alternatives.

---

## 0. Decisions (locked)

| Concern | Decision | Rationale |
|---|---|---|
| Framework | **Astro 5.x** (latest stable), static output (`output: 'static'`) | Zero-JS by default, content collections, best-in-class for static |
| Styling | **Tailwind CSS v4** via `@tailwindcss/vite` plugin (NOT the deprecated `@astrojs/tailwind` integration) | CSS-first config; all theming lives in one `@theme` block |
| Components | **Pure Astro components. No React/Vue/Svelte.** | Business sites need forms-of-content, not app interactivity. Smallest code surface; fastest sites. |
| Animation | **GSAP** (free, incl. ScrollTrigger) + **Lenis** (MIT) — used *sparingly*: subtle reveals only. No Motion. | Polish, not spectacle. Business sites must feel fast and calm. |
| Content | **Astro Content Collections**, Markdown + MDX, Zod-validated frontmatter | Git-based CMS now; Keystatic/Decap swappable later |
| Fonts | Self-hosted variable fonts via **Fontsource**. Default pairing: `@fontsource-variable/inter` (body + UI) and one display font slot (default `@fontsource-variable/manrope`), swappable per client in one place | No external font requests; per-client brand swap = change one import + one token |
| Icons | `astro-icon` + `@iconify-json/lucide` | Build-time inlined SVG |
| Hosting | **Cloudflare Pages**, pure static. `_headers` for caching/security. | |
| Extras | `@astrojs/sitemap`, `@astrojs/rss`, hand-rolled `<SEO>` component, JSON-LD LocalBusiness schema | Local SEO matters for small businesses |
| Package manager | `pnpm` |
| Lint/format | Prettier + prettier-plugin-astro + prettier-plugin-tailwindcss only |

## 1. Repo scaffold

```bash
pnpm create astro@latest astro-business-starter -- --template minimal --typescript strict
cd astro-business-starter
pnpm astro add mdx sitemap
pnpm add tailwindcss @tailwindcss/vite gsap lenis
pnpm add @fontsource-variable/inter @fontsource-variable/manrope
pnpm add astro-icon @iconify-json/lucide @astrojs/rss
pnpm add -D prettier prettier-plugin-astro prettier-plugin-tailwindcss
```

`astro.config.mjs`: site URL placeholder, `output: 'static'`, integrations `[mdx(), sitemap(), icon()]`, `vite: { plugins: [tailwindcss()] }`, `prefetch: true`.

## 2. Target file tree

```
astro-business-starter/
├── public/
│   ├── favicon.svg
│   ├── og-default.png
│   └── _headers
├── src/
│   ├── styles/global.css          # Tailwind entry + @theme tokens (THE theming file)
│   ├── config/site.ts             # business name, tagline, nav, contact, hours,
│   │                              # address, socials, analytics id — single edit point
│   ├── content.config.ts          # collections: services, posts, testimonials, faq
│   ├── content/
│   │   ├── services/   (3 demo)
│   │   ├── posts/      (2 demo)
│   │   ├── testimonials/ (3 demo)
│   │   └── faq/        (4 demo)
│   ├── layouts/Base.astro          # shell, fonts, SEO, JSON-LD, Header, Footer
│   ├── components/
│   │   ├── SEO.astro               # meta + OG + canonical + LocalBusiness JSON-LD
│   │   ├── Header.astro            # sticky nav, mobile menu (details/popover, no JS framework)
│   │   ├── Footer.astro            # contact info, hours, nav, socials
│   │   ├── Hero.astro              # headline + subhead + CTA + optional image slot
│   │   ├── Button.astro            # solid | outline | ghost
│   │   ├── Card.astro
│   │   ├── SectionHeading.astro    # eyebrow + heading + optional lede
│   │   ├── ServiceCard.astro
│   │   ├── TestimonialCard.astro
│   │   ├── FaqList.astro           # native <details> accordion
│   │   ├── CtaBand.astro           # full-width conversion section
│   │   ├── ContactBlock.astro      # address, phone (tel:), email, hours, map embed slot
│   │   └── Prose.astro             # markdown body typography
│   ├── scripts/motion.ts           # Lenis init + one GSAP reveal helper, reduced-motion aware
│   └── pages/
│       ├── index.astro             # hero → services → social proof → CTA → contact
│       ├── about.astro
│       ├── services/index.astro
│       ├── services/[...slug].astro
│       ├── blog/index.astro + blog/[...slug].astro
│       ├── contact.astro           # ContactBlock + form (see §6)
│       ├── rss.xml.ts
│       └── 404.astro
├── docs/CLIENT-SETUP.md            # per-client rebrand checklist
├── .prettierrc
├── wrangler.toml
└── README.md
```

Rule: every component ≤ ~80 lines. Prefer composition over options.

## 3. Theming system (the heart of the template)

All visual identity lives in exactly two places: the `@theme` block in `global.css` and the font imports in `Base.astro`. A client rebrand touches nothing else.

`src/styles/global.css`:

```css
@import 'tailwindcss';

@theme {
  /* Fonts — swap the import + this token per client */
  --font-display: 'Manrope Variable', sans-serif;
  --font-sans: 'Inter Variable', sans-serif;

  /* Brand — the only colors components may reference */
  --color-brand: #1d4ed8;        /* primary brand color */
  --color-brand-contrast: #ffffff;
  --color-surface: #ffffff;
  --color-surface-alt: #f7f7f5;  /* alternating section background */
  --color-text: #171717;
  --color-text-muted: #525252;
  --color-line: #e5e5e5;

  /* Shape & depth — tune per client for personality */
  --radius-base: 0.5rem;
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.08);

  /* Rhythm */
  --spacing-section: clamp(4rem, 10vw, 8rem);
}
```

Component rules:
- Components reference ONLY these tokens (via Tailwind utilities bound to them). Never hardcode hex values, radii, or shadows in components.
- Section vertical padding always uses `--spacing-section`; alternate `surface` / `surface-alt` backgrounds for rhythm.
- One brand color. Neutrals do the rest. No gradients unless a client brief asks.

## 4. Design quality bar (aesthetic-agnostic)

The frontend-design skill drives per-project direction. These floor-level rules always apply:

1. Clear visual hierarchy: one H1 per page; heading scale via `clamp()`; body 16–18px, line-height ≥ 1.6, measure ≤ 70ch.
2. Generous whitespace; content max-width container (~72rem) with consistent gutters.
3. Every page has exactly one primary CTA style; conversion path visible without scrolling on desktop and within one scroll on mobile.
4. WCAG AA contrast minimum for all text/token combinations; visible focus states; 44px minimum tap targets.
5. Motion is subtle and enter-only: fade/rise reveals ≤ 0.6s, no pinning, no scroll-jacking, `prefers-reduced-motion` fully honored (site is complete with zero JS).
6. Images via `astro:assets` `<Image />` with explicit dimensions (no layout shift).

## 5. Content model

Collections (Zod schemas in `content.config.ts`):
- **services**: title, summary, icon (lucide name), order, featured, body
- **posts**: title, description, date, tags, draft, cover?
- **testimonials**: author, role/company, quote, rating?
- **faq**: question, order, body

Seed realistic demo content for a fictional business so the template demos convincingly. Filter drafts in prod.

## 6. Contact form (static-host compatible)

No server. Implement `<ContactForm />` as a plain accessible HTML form with a `data-provider` switch documented in README:
- Default: `action` pointed at a formspree/web3forms-style endpoint placeholder (client pastes their endpoint into `site.ts`).
- Alternative documented: Cloudflare Pages Functions upgrade path (out of scope to implement).
- Include honeypot field; no CAPTCHA.

## 7. Local SEO

- `<SEO>` renders title template, description, canonical, OG/Twitter tags.
- `Base.astro` injects LocalBusiness JSON-LD built from `site.ts` (name, address, phone, hours, geo, sameAs socials).
- Sitemap + robots; RSS for blog.

## 8. Per-client workflow (`docs/CLIENT-SETUP.md`)

1. Fork/duplicate repo → rename.
2. Fill `src/config/site.ts` (all business facts).
3. Set brand tokens in `@theme`; swap display font import if the brand needs it.
4. Run frontend-design skill against the client brief to adjust tokens + Hero composition (tokens and section composition are the allowed surface for design work; component internals are not).
5. Replace demo content collections with real content.
6. Swap `og-default.png`, favicon.
7. Connect to Cloudflare Pages (`pnpm build`, output `dist`).

## 9. Acceptance criteria

1. `pnpm build` zero warnings; `astro check` clean (strict TS).
2. Lighthouse mobile on `/`: Performance ≥ 95, Accessibility ≥ 95, SEO 100.
3. Fully usable with JavaScript disabled (nav, FAQ, form included).
4. `prefers-reduced-motion` honored; total client JS < 60KB gzipped.
5. No hardcoded colors/radii/shadows outside `@theme`. Grep check: no hex values in `src/components` or `src/pages`.
6. Rebrand test: changing only `site.ts` + `@theme` + font import yields a coherent, differently-branded site.
7. New service/post/testimonial = one markdown file, zero code changes.
8. Valid LocalBusiness JSON-LD (test with a schema validator).

## 10. Out of scope (v1)

Booking/scheduling widgets, e-commerce, i18n, CMS UI, analytics beyond a script slot in `site.ts`, multi-location schema, dark mode (business sites default light; add per client if briefed).

