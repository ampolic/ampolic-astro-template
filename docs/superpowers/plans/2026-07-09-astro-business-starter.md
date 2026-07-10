# astro-business-starter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable, client-themeable static Astro 5 template for small-business
websites — fast, accessible, content-driven — with light/dark theming, a Cloudflare Pages
Function contact form, and a home-services (HVAC) demo brand.

**Architecture:** Astro 5 static output. All visual identity in one `@theme` block
(`src/styles/global.css`) + font imports (`Base.astro`); all business facts in
`src/config/site.ts`; all content in Zod-validated Content Collections. Pure `.astro`
components (no UI framework). Motion via a single reduced-motion-aware `motion.ts`
(GSAP + Lenis). The contact form is the one dynamic piece: a Cloudflare Pages Function
verifying Turnstile and sending via Resend, with an honeypot/timing no-JS fallback.

**Tech Stack:** Astro 5, Tailwind CSS v4 (`@tailwindcss/vite`), TypeScript strict,
Content Collections + MDX + Zod, GSAP + ScrollTrigger + Lenis, Fontsource variable fonts,
`astro-icon` + lucide, `@astrojs/sitemap` + `@astrojs/rss`, Cloudflare Pages + Turnstile +
Resend, Vitest + `@cloudflare/vitest-pool-workers`.

**Reference docs:** Spec at `docs/superpowers/specs/2026-07-09-astro-business-starter-design.md`;
locked build plan at `PLAN.md`. When touching Tailwind v4 or Astro 5 config, consult Context7
(per CLAUDE.md) — do not rely on memory.

## Global Constraints

Copied verbatim from spec + PLAN + CLAUDE.md. Every task's requirements implicitly include these.

- **Framework:** Astro 5.x, `output: 'static'`. No React/Vue/Svelte — pure `.astro` only.
- **Styling:** Tailwind v4 via `@tailwindcss/vite` ONLY. Never `@astrojs/tailwind`, never `tailwind.config.js`. CSS-first `@theme`.
- **Theming discipline:** ALL colors/radii/shadows live in the `@theme` block of `src/styles/global.css`. Components reference design tokens only. NEVER hardcode hex, radius, or shadow values in `src/components` or `src/pages`. One brand color (`--color-brand`, plus `--color-brand-dark`); neutrals do the rest.
- **Config single-source:** ALL business facts (name, contact, hours, nav, socials, form endpoint, analytics) live in `src/config/site.ts`. Never inline them in components.
- **Content:** Adding a service/post/testimonial/FAQ requires ONLY a new markdown/MDX file — never a code change. If a code change is needed, the template is wrong; fix the template.
- **Fonts:** Fontsource variable packages only. No Google Fonts CDN, no external fonts.
- **Motion:** GSAP + Lenis via `src/scripts/motion.ts` ONLY. Subtle, enter-only, ≤0.6s. No pinning, no scroll-jacking. `prefers-reduced-motion` fully disables BOTH Lenis and GSAP reveals. Site complete with JS disabled (nav, FAQ, form all work).
- **Dark mode:** Full light/dark with a system-aware, persisted toggle. Anti-FOUC via one blocking inline `<head>` script (the ONLY sanctioned render-blocking JS). WCAG AA verified in both themes.
- **Design floor:** One H1 per page. Body 16–18px, line-height ≥ 1.6, measure ≤ 70ch. `--spacing-section` rhythm, alternating surface/surface-alt. Exactly one primary CTA style per page. WCAG AA contrast, visible focus states, 44px tap targets. Images only via `astro:assets` `<Image />` with explicit dimensions.
- **Aesthetic ownership:** Per-project visual direction comes from the `frontend-design` skill, operating only on tokens + Hero/section composition — NOT component internals. Tasks that build presentational components/pages invoke `frontend-design` for composition within these guardrails.
- **Workflow:** Every component ≤ 80 lines. Prefer composition over prop flags. Package manager: **pnpm**. After every batch of edits: `pnpm check` then `pnpm build` — both must pass before a task is done.
- **Dependencies:** Do not add any dependency beyond those introduced in this plan without asking.
- **Definition of done (acceptance):** `astro check` clean; `pnpm build` zero warnings; no hex in `src/components`/`src/pages` (grep); client JS < 60KB gzipped; rebrand test passes; new content = one file; valid LocalBusiness JSON-LD; usable with JS disabled; `prefers-reduced-motion` honored; WCAG AA in both themes.

**Demo business (seed identity):** *Summit Heating & Air* — fictional single-location,
service-area HVAC company. Placeholder facts used throughout seed content; each real client
swaps `site.ts` + `@theme` + content.

---

## Phase 0 — Foundation

### Task 0: Scaffold project, tooling, and test harness

**Files:**
- Create: `astro.config.mjs`, `tsconfig.json`, `package.json` (via scaffold), `.prettierrc`, `.gitignore`
- Create: `src/styles/global.css` (minimal, expanded in Task 2)
- Create: `src/pages/index.astro` (temporary smoke page, replaced in Phase 6)
- Create: `vitest.config.ts`, `test/smoke.test.ts`
- Create: `wrangler.toml`, `public/_headers`, `public/favicon.svg`

**Interfaces:**
- Produces: a building Astro project; `pnpm check`, `pnpm build`, `pnpm test` all runnable.

- [ ] **Step 1: Scaffold Astro into the current repo**

The repo already contains `CLAUDE.md`, `PLAN.md`, `docs/`. Scaffold in place (choose "no" to
overwrite existing files if prompted; delete the generated sample `src/pages/index.astro` conflict manually if needed):

```bash
pnpm create astro@latest . -- --template minimal --typescript strict --no-git --skip-houston
```

Then add integrations and dependencies exactly as PLAN §1 specifies:

```bash
pnpm astro add mdx sitemap --yes
pnpm add tailwindcss @tailwindcss/vite gsap lenis
pnpm add @fontsource-variable/inter @fontsource-variable/manrope
pnpm add astro-icon @iconify-json/lucide @astrojs/rss
pnpm add -D prettier prettier-plugin-astro prettier-plugin-tailwindcss
pnpm add -D vitest @cloudflare/vitest-pool-workers
```

- [ ] **Step 2: Write `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// TODO before launch: replace with the real production URL.
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  prefetch: true,
  integrations: [mdx(), sitemap(), icon()],
  vite: { plugins: [tailwindcss()] },
});
```

- [ ] **Step 3: Minimal `src/styles/global.css`** (full tokens land in Task 2)

```css
@import 'tailwindcss';
```

- [ ] **Step 4: Add scripts to `package.json`**

Ensure the `scripts` block contains:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "format": "prettier --write ."
  }
}
```

- [ ] **Step 5: `.prettierrc`**

```json
{
  "plugins": ["prettier-plugin-astro", "prettier-plugin-tailwindcss"],
  "overrides": [{ "files": "*.astro", "options": { "parser": "astro" } }]
}
```

- [ ] **Step 6: `vitest.config.ts`** (Workers pool for the Pages Function; node for the rest)

```ts
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: { miniflare: { compatibilityDate: '2024-09-23' } },
    },
  },
});
```

- [ ] **Step 7: `wrangler.toml`**

```toml
name = "astro-business-starter"
compatibility_date = "2024-09-23"
pages_build_output_dir = "dist"

# Secrets are set in the Cloudflare dashboard, NOT committed:
#   TURNSTILE_SECRET_KEY, RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
```

- [ ] **Step 8: `public/_headers`** (caching + baseline security)

```
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: DENY
  Permissions-Policy: geolocation=(), microphone=(), camera=()

/_astro/*
  Cache-Control: public, max-age=31536000, immutable
```

- [ ] **Step 9: Temporary smoke page `src/pages/index.astro`**

```astro
---
---
<html lang="en">
  <head><meta charset="utf-8" /><title>Smoke</title></head>
  <body><h1 class="text-brand">it builds</h1></body>
</html>
```

Add a matching token so the utility resolves (temporary; replaced in Task 2). In `global.css`:

```css
@import 'tailwindcss';
@theme {
  --color-brand: #1d4ed8;
}
```

- [ ] **Step 10: Smoke test `test/smoke.test.ts`**

```ts
import { describe, it, expect } from 'vitest';

describe('toolchain', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 11: Run the gates**

```bash
pnpm test
pnpm check
pnpm build
```

Expected: test passes; `astro check` reports 0 errors; `build` completes with 0 warnings and emits `dist/`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "chore: scaffold Astro 5 + Tailwind v4 + Vitest toolchain"
```

---

## Phase 1 — Theming, config, and content model

### Task 1: Theme tokens (`@theme`, light + dark)

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: the complete token vocabulary components consume — `--color-brand`,
  `--color-brand-dark`, `--color-brand-contrast`, `--color-surface`, `--color-surface-alt`,
  `--color-text`, `--color-text-muted`, `--color-line`, `--font-display`, `--font-sans`,
  `--radius-base`, `--shadow-card`, `--spacing-section`. Dark values apply under
  `@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]`; light values under
  `:root[data-theme="light"]` and the base `:root`.

- [ ] **Step 1: Write the full `global.css`**

```css
@import 'tailwindcss';

@theme {
  /* Fonts — swap the import in Base.astro + these tokens per client */
  --font-display: 'Manrope Variable', sans-serif;
  --font-sans: 'Inter Variable', sans-serif;

  /* Brand — the only brand color components may reference */
  --color-brand: #1d4ed8;
  --color-brand-dark: #60a5fa; /* dark-tuned brand, AA on dark surfaces */
  --color-brand-contrast: #ffffff;

  /* Semantic neutrals (light defaults) */
  --color-surface: #ffffff;
  --color-surface-alt: #f7f7f5;
  --color-text: #171717;
  --color-text-muted: #525252;
  --color-line: #e5e5e5;

  /* Shape & depth */
  --radius-base: 0.5rem;
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.08);

  /* Rhythm */
  --spacing-section: clamp(4rem, 10vw, 8rem);
}

/* Dark overrides — remap the SAME token names so components never branch.
   Applied both by system preference and by an explicit [data-theme] choice. */
@layer base {
  :root[data-theme='dark'],
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme='light']) {
      --color-brand: #60a5fa;
      --color-brand-contrast: #0a0a0a;
      --color-surface: #0a0a0a;
      --color-surface-alt: #171717;
      --color-text: #f5f5f5;
      --color-text-muted: #a3a3a3;
      --color-line: #262626;
      --shadow-card: 0 1px 3px rgb(0 0 0 / 0.5);
    }
  }
}
```

> Note: CSS can't nest an at-rule inside a selector list the way shown above in one block.
> Implement the dark override as two explicit rules to keep it valid:

```css
/* Explicit choice wins */
:root[data-theme='dark'] {
  --color-brand: #60a5fa;
  --color-brand-contrast: #0a0a0a;
  --color-surface: #0a0a0a;
  --color-surface-alt: #171717;
  --color-text: #f5f5f5;
  --color-text-muted: #a3a3a3;
  --color-line: #262626;
  --shadow-card: 0 1px 3px rgb(0 0 0 / 0.5);
}

/* System preference, only when the user hasn't explicitly chosen light */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme='light']):not([data-theme='dark']) {
    --color-brand: #60a5fa;
    --color-brand-contrast: #0a0a0a;
    --color-surface: #0a0a0a;
    --color-surface-alt: #171717;
    --color-text: #f5f5f5;
    --color-text-muted: #a3a3a3;
    --color-line: #262626;
    --shadow-card: 0 1px 3px rgb(0 0 0 / 0.5);
  }
}

/* Base page defaults */
html {
  background: var(--color-surface);
  color: var(--color-text);
  font-family: var(--font-sans);
}
```

- [ ] **Step 2: Verify tokens resolve** — update the smoke page to exercise a few utilities:

```astro
<body class="bg-surface text-text">
  <h1 class="text-brand font-display">Summit Heating &amp; Air</h1>
  <p class="text-text-muted">tokens resolve</p>
</body>
```

- [ ] **Step 3: Run gates**

```bash
pnpm check && pnpm build
```

Expected: clean; utilities `bg-surface`, `text-text`, `text-brand`, `font-display` compile.

- [ ] **Step 4: Manual dark check** — `pnpm dev`, toggle OS dark mode, confirm surfaces/text invert. (Toggle UI arrives in Task 6.)

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css src/pages/index.astro
git commit -m "feat: theming tokens with light/dark @theme layer"
```

### Task 2: `src/config/site.ts` (single source of business facts)

**Files:**
- Create: `src/config/site.ts`

**Interfaces:**
- Produces: `site` (default export/const) and a `Site` type. Fields consumed across layout,
  SEO/JSON-LD, header, footer, contact:
  `name, legalName, tagline, description, url, logo, email, phone, address{street,locality,region,postalCode,country}, geo{lat,lng}, hours: Array<{days:string; opens:string; closes:string}>, nav: Array<{label:string; href:string}>, socials: Array<{label:string; href:string; icon:string}>, analytics{provider:'none'|'plausible'|'ga'; id?:string}, form{endpoint:string; turnstileSiteKey:string; recipientLabel:string}`.

- [ ] **Step 1: Write `site.ts`** with typed demo data

```ts
export interface Site {
  name: string;
  legalName: string;
  tagline: string;
  description: string;
  url: string;
  logo: string;
  email: string;
  phone: string;
  address: { street: string; locality: string; region: string; postalCode: string; country: string };
  geo: { lat: number; lng: number };
  hours: Array<{ days: string; opens: string; closes: string }>;
  nav: Array<{ label: string; href: string }>;
  socials: Array<{ label: string; href: string; icon: string }>;
  analytics: { provider: 'none' | 'plausible' | 'ga'; id?: string };
  form: { endpoint: string; turnstileSiteKey: string; recipientLabel: string };
}

export const site: Site = {
  name: 'Summit Heating & Air',
  legalName: 'Summit Heating & Air LLC',
  tagline: 'Comfort you can count on, all year round.',
  description:
    'Licensed HVAC service for the greater Boulder area — AC repair & install, furnace and heating, and indoor air quality.',
  url: 'https://example.com',
  logo: '/favicon.svg',
  email: 'hello@summithvac.example',
  phone: '+1-303-555-0142',
  address: { street: '1420 Pearl St', locality: 'Boulder', region: 'CO', postalCode: '80302', country: 'US' },
  geo: { lat: 40.019, lng: -105.278 },
  hours: [
    { days: 'Mon–Fri', opens: '07:30', closes: '18:00' },
    { days: 'Sat', opens: '08:00', closes: '14:00' },
  ],
  nav: [
    { label: 'Services', href: '/services' },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  socials: [
    { label: 'Facebook', href: 'https://facebook.com/', icon: 'lucide:facebook' },
    { label: 'Instagram', href: 'https://instagram.com/', icon: 'lucide:instagram' },
  ],
  analytics: { provider: 'none' },
  form: { endpoint: '/api/contact', turnstileSiteKey: '1x00000000000000000000AA', recipientLabel: 'the Summit team' },
};

export default site;
```

- [ ] **Step 2: Gate**

```bash
pnpm check
```

Expected: 0 errors (strict TS validates the shape).

- [ ] **Step 3: Commit**

```bash
git add src/config/site.ts
git commit -m "feat: site.ts single-source business config"
```

### Task 3: Content collections + Zod schemas (with unit tests)

**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/schemas.ts` (exported Zod schemas, so tests can import them without the Astro runtime)
- Test: `test/schemas.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: exported schemas `serviceSchema, postSchema, testimonialSchema, faqSchema` and the
  registered `collections` object. Collections: `services`, `posts`, `testimonials`, `faq`.
  Field contracts:
  - service: `title:string, summary:string, icon:string, order:number, featured:boolean(default false)`
  - post: `title:string, description:string, date:coerce.date, tags:string[](default []), draft:boolean(default false), cover?:image`
  - testimonial: `author:string, role:string, quote:string, rating?:number(1-5)`
  - faq: `question:string, order:number`

- [ ] **Step 1: Write failing schema tests `test/schemas.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { serviceSchema, postSchema, testimonialSchema, faqSchema } from '../src/content/schemas';

describe('service schema', () => {
  it('defaults featured to false', () => {
    const parsed = serviceSchema.parse({ title: 'AC Repair', summary: 'Fast fixes', icon: 'lucide:wind', order: 1 });
    expect(parsed.featured).toBe(false);
  });
  it('rejects a missing title', () => {
    expect(() => serviceSchema.parse({ summary: 'x', icon: 'i', order: 1 })).toThrow();
  });
});

describe('post schema', () => {
  it('coerces an ISO date string to a Date and defaults arrays', () => {
    const parsed = postSchema.parse({ title: 'T', description: 'D', date: '2026-01-05' });
    expect(parsed.date).toBeInstanceOf(Date);
    expect(parsed.tags).toEqual([]);
    expect(parsed.draft).toBe(false);
  });
});

describe('testimonial schema', () => {
  it('rejects a rating above 5', () => {
    expect(() => testimonialSchema.parse({ author: 'A', role: 'R', quote: 'Q', rating: 6 })).toThrow();
  });
});

describe('faq schema', () => {
  it('requires question and order', () => {
    expect(() => faqSchema.parse({ question: 'Q?' })).toThrow();
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test test/schemas.test.ts
```

Expected: FAIL — `../src/content/schemas` not found.

- [ ] **Step 3: Write `src/content/schemas.ts`**

```ts
import { z } from 'astro/zod';

export const serviceSchema = z.object({
  title: z.string(),
  summary: z.string(),
  icon: z.string(),
  order: z.number(),
  featured: z.boolean().default(false),
});

export const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export const testimonialSchema = z.object({
  author: z.string(),
  role: z.string(),
  quote: z.string(),
  rating: z.number().min(1).max(5).optional(),
});

export const faqSchema = z.object({
  question: z.string(),
  order: z.number(),
});
```

- [ ] **Step 4: Run to verify pass**

```bash
pnpm test test/schemas.test.ts
```

Expected: PASS (all four suites).

- [ ] **Step 5: Write `src/content.config.ts`** (wires schemas to the `image()` helper for the post cover)

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { serviceSchema, postSchema, testimonialSchema, faqSchema } from './content/schemas';

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/[^_]*.{md,mdx}' }),
  schema: serviceSchema,
});
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/[^_]*.{md,mdx}' }),
  schema: ({ image }) => postSchema.extend({ cover: image().optional() }),
});
const testimonials = defineCollection({
  loader: glob({ base: './src/content/testimonials', pattern: '**/[^_]*.{md,mdx}' }),
  schema: testimonialSchema,
});
const faq = defineCollection({
  loader: glob({ base: './src/content/faq', pattern: '**/[^_]*.{md,mdx}' }),
  schema: faqSchema,
});

export const collections = { services, posts, testimonials, faq };
```

- [ ] **Step 6: Gate + commit**

```bash
pnpm check && pnpm build
git add src/content.config.ts src/content/schemas.ts test/schemas.test.ts
git commit -m "feat: content collections + Zod schemas with unit tests"
```

### Task 4: Seed demo content (HVAC)

**Files:**
- Create: `src/content/services/{ac-repair,heating,air-quality}.md`
- Create: `src/content/testimonials/{diane-m,carlos-r,the-hensons}.md`
- Create: `src/content/faq/{financing,service-area,emergency,maintenance}.md`
- Create: `src/content/posts/{seasonal-tune-up,choosing-a-system}.md`

**Interfaces:**
- Consumes: schemas from Task 3.
- Produces: build-validated demo entries used by Phase 6 pages.

- [ ] **Step 1: Services** — e.g. `ac-repair.md`:

```md
---
title: AC Repair & Installation
summary: Same-day diagnostics and honest quotes on repairs, plus efficient new-system installs sized for your home.
icon: lucide:wind
order: 1
featured: true
---

When your AC quits in July, you need it back fast. We diagnose, quote, and fix — no upsell,
no surprises. Ready for a replacement? We size and install high-efficiency systems that lower
your bills.
```

Create `heating.md` (`icon: lucide:flame`, `order: 2`, `featured: true`) and `air-quality.md`
(`icon: lucide:air-vent`, `order: 3`, `featured: false`) following the same shape with realistic prose.

- [ ] **Step 2: Testimonials** — e.g. `diane-m.md`:

```md
---
author: Diane M.
role: Homeowner, North Boulder
quote: They had our furnace running again the same afternoon I called. Fair price, no drama.
rating: 5
---
```

Create two more with varied roles and quotes.

- [ ] **Step 3: FAQ** — e.g. `financing.md`:

```md
---
question: Do you offer financing on new systems?
order: 1
---

Yes — we offer flexible financing on qualifying installations, including 0% options for
approved buyers. Ask us for current terms when we quote your system.
```

Create `service-area.md`, `emergency.md`, `maintenance.md` (orders 2–4) with real answers.

- [ ] **Step 4: Posts** — e.g. `seasonal-tune-up.md`:

```md
---
title: Why a Seasonal Tune-Up Pays for Itself
description: A short guide to what a maintenance visit actually checks — and how it prevents the expensive breakdowns.
date: 2026-05-14
tags: [maintenance, efficiency]
draft: false
---

## The five-minute version

A tune-up isn't a formality...
```

Create `choosing-a-system.md` with realistic body content.

- [ ] **Step 5: Gate** — build validates all frontmatter:

```bash
pnpm build
```

Expected: 0 warnings; collections resolve.

- [ ] **Step 6: Commit**

```bash
git add src/content
git commit -m "content: HVAC demo seed (services, testimonials, faq, posts)"
```

---

## Phase 2 — Layout shell

> Presentational tasks (5, 7, 8, 9) invoke the **frontend-design** skill for composition within
> the token guardrails. The skeletons below are real, compilable starting points that satisfy the
> interface + design floor; frontend-design refines spacing, scale, and Hero/section composition —
> it must not introduce hardcoded hex/radius/shadow values or break the Props contracts.

### Task 5: `Base.astro` + `SEO.astro` + LocalBusiness JSON-LD + anti-FOUC + fonts

**Files:**
- Create: `src/layouts/Base.astro`
- Create: `src/components/SEO.astro`
- Create: `src/lib/jsonld.ts`
- Test: `test/jsonld.test.ts`

**Interfaces:**
- Consumes: `site` (Task 2).
- Produces:
  - `buildLocalBusinessJsonLd(site): object` — pure function in `src/lib/jsonld.ts`.
  - `SEO.astro` props: `{ title: string; description?: string; canonical?: string; image?: string; noindex?: boolean }`.
  - `Base.astro` props: `{ title: string; description?: string; canonical?: string; image?: string; noindex?: boolean }` with a default `<slot />`; renders `<Header />`/`<Footer />` (Task 7) and the theme inline script.

- [ ] **Step 1: Write failing JSON-LD test `test/jsonld.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { buildLocalBusinessJsonLd } from '../src/lib/jsonld';
import { site } from '../src/config/site';

describe('LocalBusiness JSON-LD', () => {
  const ld = buildLocalBusinessJsonLd(site);
  it('declares the LocalBusiness type and name', () => {
    expect(ld['@type']).toBe('LocalBusiness');
    expect(ld.name).toBe(site.name);
  });
  it('maps address and geo', () => {
    expect(ld.address.streetAddress).toBe(site.address.street);
    expect(ld.geo.latitude).toBe(site.geo.lat);
  });
  it('emits one openingHoursSpecification per hours row', () => {
    expect(ld.openingHoursSpecification).toHaveLength(site.hours.length);
  });
  it('lists socials under sameAs', () => {
    expect(ld.sameAs).toEqual(site.socials.map((s) => s.href));
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test test/jsonld.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/jsonld.ts`**

```ts
import type { Site } from '../config/site';

export function buildLocalBusinessJsonLd(site: Site) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: site.name,
    legalName: site.legalName,
    description: site.description,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    image: new URL(site.logo, site.url).href,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: site.geo.lat, longitude: site.geo.lng },
    openingHoursSpecification: site.hours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.days,
      opens: h.opens,
      closes: h.closes,
    })),
    sameAs: site.socials.map((s) => s.href),
  };
}
```

- [ ] **Step 4: Run to verify pass**

```bash
pnpm test test/jsonld.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write `src/components/SEO.astro`**

```astro
---
import { site } from '../config/site';
interface Props { title: string; description?: string; canonical?: string; image?: string; noindex?: boolean }
const { title, description = site.description, canonical, image = '/og-default.png', noindex = false } = Astro.props;
const pageTitle = title === site.name ? title : `${title} · ${site.name}`;
const canonicalUrl = new URL(canonical ?? Astro.url.pathname, site.url).href;
const ogImage = new URL(image, site.url).href;
---
<title>{pageTitle}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonicalUrl} />
{noindex && <meta name="robots" content="noindex, nofollow" />}
<meta property="og:type" content="website" />
<meta property="og:title" content={pageTitle} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalUrl} />
<meta property="og:image" content={ogImage} />
<meta name="twitter:card" content="summary_large_image" />
```

- [ ] **Step 6: Write `src/layouts/Base.astro`** (fonts, anti-FOUC script, SEO, JSON-LD, shell)

```astro
---
import '@fontsource-variable/inter';
import '@fontsource-variable/manrope';
import '../styles/global.css';
import SEO from '../components/SEO.astro';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { site } from '../config/site';
import { buildLocalBusinessJsonLd } from '../lib/jsonld';
interface Props { title: string; description?: string; canonical?: string; image?: string; noindex?: boolean }
const { title, description, canonical, image, noindex } = Astro.props;
const jsonld = buildLocalBusinessJsonLd(site);
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    {/* Anti-FOUC: the ONLY render-blocking script. Sets theme before paint. */}
    <script is:inline>
      (() => {
        const stored = localStorage.getItem('theme');
        const system = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', stored || system);
      })();
    </script>
    <SEO title={title} description={description} canonical={canonical} image={image} noindex={noindex} />
    <script type="application/ld+json" set:html={JSON.stringify(jsonld)} />
  </head>
  <body class="bg-surface text-text font-sans">
    <a href="#main" class="sr-only focus:not-sr-only">Skip to content</a>
    <Header />
    <main id="main"><slot /></main>
    <Footer />
    <script>
      import { initMotion } from '../scripts/motion';
      initMotion();
    </script>
  </body>
</html>
```

> Header/Footer/motion are created in Tasks 6–7 + Phase 3. If executing strictly in order, stub
> `Header.astro`/`Footer.astro` as empty `<header></header>`/`<footer></footer>` and
> `scripts/motion.ts` with `export function initMotion() {}` so this task builds; later tasks fill them.

- [ ] **Step 7: Stub Header/Footer/motion, then gate**

```bash
pnpm test && pnpm check && pnpm build
```

Expected: tests pass; check clean; build emits valid `<script type="application/ld+json">` in the page `<head>`.

- [ ] **Step 8: Validate JSON-LD** — copy the rendered script from `dist/index.html` into a schema validator (e.g. schema.org validator) and confirm no errors.

- [ ] **Step 9: Commit**

```bash
git add src/layouts src/components/SEO.astro src/lib test/jsonld.test.ts
git commit -m "feat: Base layout, SEO, LocalBusiness JSON-LD, anti-FOUC theme script"
```

### Task 6: Theme toggle

**Files:**
- Create: `src/components/ThemeToggle.astro`
- Create: `src/scripts/theme.ts`
- Test: `test/theme.test.ts`

**Interfaces:**
- Consumes: the `data-theme` attribute + `localStorage.theme` set by the anti-FOUC script.
- Produces: `toggleTheme(root, storage): 'light' | 'dark'` — pure, testable; flips `data-theme`
  and persists. `ThemeToggle.astro` renders a `<button>` wired to it.

- [ ] **Step 1: Write failing test `test/theme.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { toggleTheme } from '../src/scripts/theme';

function fakeRoot(initial: string) {
  let theme = initial;
  return { getAttribute: () => theme, setAttribute: (_: string, v: string) => (theme = v) } as any;
}
function fakeStorage() {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => m.set(k, v) } as any;
}

describe('toggleTheme', () => {
  it('flips dark to light and persists', () => {
    const root = fakeRoot('dark');
    const store = fakeStorage();
    expect(toggleTheme(root, store)).toBe('light');
    expect(store.getItem('theme')).toBe('light');
    expect(root.getAttribute('data-theme')).toBe('light');
  });
  it('flips light to dark', () => {
    expect(toggleTheme(fakeRoot('light'), fakeStorage())).toBe('dark');
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test test/theme.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/scripts/theme.ts`**

```ts
type Root = { getAttribute(name: string): string | null; setAttribute(name: string, value: string): void };
type Storage = { getItem(key: string): string | null; setItem(key: string, value: string): void };

export function toggleTheme(root: Root, storage: Storage): 'light' | 'dark' {
  const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  storage.setItem('theme', next);
  return next;
}
```

- [ ] **Step 4: Run to verify pass**

```bash
pnpm test test/theme.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write `src/components/ThemeToggle.astro`**

```astro
---
import { Icon } from 'astro-icon/components';
---
<button type="button" id="theme-toggle" class="grid size-11 place-items-center rounded-[--radius-base] text-text-muted hover:text-text" aria-label="Toggle color theme">
  <Icon name="lucide:sun" class="size-5 dark:hidden" />
  <Icon name="lucide:moon" class="hidden size-5 dark:block" />
</button>
<script>
  import { toggleTheme } from '../scripts/theme';
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    toggleTheme(document.documentElement, localStorage);
  });
</script>
```

> The sun/moon `dark:` variants require Tailwind's dark variant to key off `data-theme`. Add to `global.css`:
> ```css
> @custom-variant dark (&:where([data-theme='dark'], [data-theme='dark'] *));
> ```

- [ ] **Step 6: Gate**

```bash
pnpm test && pnpm check && pnpm build
```

Expected: all pass; toggle button renders.

- [ ] **Step 7: Manual check** — `pnpm dev`: clicking the toggle flips theme, persists across reload, and no flash on reload.

- [ ] **Step 8: Commit**

```bash
git add src/components/ThemeToggle.astro src/scripts/theme.ts test/theme.test.ts src/styles/global.css
git commit -m "feat: system-aware persisted theme toggle"
```

### Task 7: `Header.astro` + `Footer.astro`

**Files:**
- Create/replace: `src/components/Header.astro`, `src/components/Footer.astro`

**Interfaces:**
- Consumes: `site.nav`, `site.socials`, `site` contact facts; `ThemeToggle`.
- Produces: sticky header with a no-JS mobile menu (`<details>`), footer with contact/hours/nav/socials.

- [ ] **Step 1: `Header.astro`** (invoke frontend-design for composition; skeleton must stay no-JS)

```astro
---
import { site } from '../config/site';
import ThemeToggle from './ThemeToggle.astro';
const path = Astro.url.pathname;
---
<header class="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur">
  <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
    <a href="/" class="font-display text-lg font-semibold">{site.name}</a>
    <nav class="hidden items-center gap-6 md:flex" aria-label="Primary">
      {site.nav.map((i) => (
        <a href={i.href} aria-current={path.startsWith(i.href) ? 'page' : undefined}
           class="text-text-muted hover:text-text aria-[current=page]:text-text">{i.label}</a>
      ))}
      <ThemeToggle />
    </nav>
    <details class="relative md:hidden">
      <summary class="grid size-11 cursor-pointer place-items-center rounded-[--radius-base]" aria-label="Menu">☰</summary>
      <nav class="absolute right-0 mt-2 flex w-48 flex-col gap-1 rounded-[--radius-base] border border-line bg-surface p-2 shadow-card" aria-label="Mobile">
        {site.nav.map((i) => <a href={i.href} class="rounded-[--radius-base] px-3 py-2 hover:bg-surface-alt">{i.label}</a>)}
        <ThemeToggle />
      </nav>
    </details>
  </div>
</header>
```

- [ ] **Step 2: `Footer.astro`**

```astro
---
import { site } from '../config/site';
import { Icon } from 'astro-icon/components';
---
<footer class="border-t border-line bg-surface-alt">
  <div class="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
    <div>
      <p class="font-display text-lg font-semibold">{site.name}</p>
      <p class="mt-2 text-text-muted">{site.tagline}</p>
    </div>
    <div class="text-text-muted">
      <p>{site.address.street}, {site.address.locality}, {site.address.region}</p>
      <p><a href={`tel:${site.phone}`} class="hover:text-text">{site.phone}</a></p>
      <p><a href={`mailto:${site.email}`} class="hover:text-text">{site.email}</a></p>
      {site.hours.map((h) => <p>{h.days}: {h.opens}–{h.closes}</p>)}
    </div>
    <nav class="flex flex-col gap-2" aria-label="Footer">
      {site.nav.map((i) => <a href={i.href} class="text-text-muted hover:text-text">{i.label}</a>)}
      <div class="mt-2 flex gap-3">
        {site.socials.map((s) => <a href={s.href} aria-label={s.label}><Icon name={s.icon} class="size-5" /></a>)}
      </div>
    </nav>
  </div>
</footer>
```

- [ ] **Step 3: Gate**

```bash
pnpm check && pnpm build
```

Expected: clean; header/footer render on the smoke page.

- [ ] **Step 4: No-JS check** — `pnpm dev`, disable JS in devtools: mobile `<details>` menu opens, all nav links work.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro
git commit -m "feat: sticky header (no-JS mobile menu) and footer"
```

---

## Phase 3 — Motion

### Task 8: `motion.ts` (GSAP + Lenis, reduced-motion fully disables both)

**Files:**
- Create/replace: `src/scripts/motion.ts`
- Create: `src/scripts/prefersReducedMotion.ts` (testable guard)
- Test: `test/motion-guard.test.ts`

**Interfaces:**
- Produces: `shouldAnimate(mediaQuery): boolean` (pure) and `initMotion(): void` (called by Base).
  When `shouldAnimate` is false, neither Lenis nor GSAP reveals initialize.

- [ ] **Step 1: Write failing guard test `test/motion-guard.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { shouldAnimate } from '../src/scripts/prefersReducedMotion';

describe('shouldAnimate', () => {
  it('returns false when the user prefers reduced motion', () => {
    expect(shouldAnimate({ matches: true } as any)).toBe(false);
  });
  it('returns true otherwise', () => {
    expect(shouldAnimate({ matches: false } as any)).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test test/motion-guard.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/scripts/prefersReducedMotion.ts`**

```ts
export function shouldAnimate(mq: { matches: boolean }): boolean {
  return !mq.matches;
}
```

- [ ] **Step 4: Run to verify pass**

```bash
pnpm test test/motion-guard.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write `src/scripts/motion.ts`** (guarded init; both libs skipped under reduced motion)

```ts
import { shouldAnimate } from './prefersReducedMotion';

export function initMotion(): void {
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  if (!shouldAnimate(mq)) return; // Lenis AND GSAP fully disabled — native scroll, no reveals.

  Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')]).then(
    ([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 0.9 });
      const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      // Enter-only fade/rise, ≤0.6s, no pinning, no scrub.
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
    },
  );
}
```

- [ ] **Step 6: Gate**

```bash
pnpm test && pnpm check && pnpm build
```

Expected: pass; GSAP/Lenis load as dynamic chunks (kept out of the initial bundle).

- [ ] **Step 7: Manual reduced-motion check** — devtools "Emulate prefers-reduced-motion: reduce": no smooth scroll, elements visible immediately (no reveal). Then normal: subtle rise on scroll.

- [ ] **Step 8: Commit**

```bash
git add src/scripts/motion.ts src/scripts/prefersReducedMotion.ts test/motion-guard.test.ts
git commit -m "feat: reduced-motion-aware GSAP+Lenis motion"
```

---

## Phase 4 — UI + domain components

> All Phase 4 tasks: invoke **frontend-design** for composition. Every component ≤ 80 lines,
> tokens only (no hex/radius/shadow literals), 44px tap targets, visible focus, AA in both themes.

### Task 9: Primitive components — `Button`, `Card`, `SectionHeading`, `Prose`

**Files:**
- Create: `src/components/{Button,Card,SectionHeading,Prose}.astro`

**Interfaces:**
- Produces:
  - `Button.astro` props `{ href?: string; variant?: 'solid'|'outline'|'ghost'; type?: string }` + slot. Renders `<a>` when `href`, else `<button>`.
  - `Card.astro` — surface container + slot.
  - `SectionHeading.astro` props `{ eyebrow?: string; heading: string; lede?: string }`.
  - `Prose.astro` — typographic wrapper + slot (measure ≤ 70ch, line-height ≥ 1.6).

- [ ] **Step 1: `Button.astro`**

```astro
---
interface Props { href?: string; variant?: 'solid' | 'outline' | 'ghost'; type?: 'button' | 'submit' }
const { href, variant = 'solid', type = 'button' } = Astro.props;
const base = 'inline-flex min-h-11 items-center justify-center rounded-[--radius-base] px-5 font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand';
const styles = {
  solid: 'bg-brand text-brand-contrast hover:opacity-90',
  outline: 'border border-brand text-brand hover:bg-brand hover:text-brand-contrast',
  ghost: 'text-brand hover:bg-surface-alt',
}[variant];
const cls = `${base} ${styles}`;
---
{href ? <a href={href} class={cls}><slot /></a> : <button type={type} class={cls}><slot /></button>}
```

- [ ] **Step 2: `Card.astro`**

```astro
---
---
<div class="rounded-[--radius-base] border border-line bg-surface p-6 shadow-card"><slot /></div>
```

- [ ] **Step 3: `SectionHeading.astro`**

```astro
---
interface Props { eyebrow?: string; heading: string; lede?: string }
const { eyebrow, heading, lede } = Astro.props;
---
<div class="mx-auto max-w-2xl text-center">
  {eyebrow && <p class="font-medium text-brand">{eyebrow}</p>}
  <h2 class="mt-2 font-display text-3xl font-semibold text-balance sm:text-4xl">{heading}</h2>
  {lede && <p class="mt-4 text-lg text-text-muted">{lede}</p>}
</div>
```

- [ ] **Step 4: `Prose.astro`**

```astro
---
---
<div class="mx-auto max-w-[68ch] leading-relaxed [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:mt-4 [&_a]:text-brand [&_a]:underline">
  <slot />
</div>
```

- [ ] **Step 5: Gate + commit**

```bash
pnpm check && pnpm build
git add src/components/Button.astro src/components/Card.astro src/components/SectionHeading.astro src/components/Prose.astro
git commit -m "feat: primitive components (Button, Card, SectionHeading, Prose)"
```

### Task 10: Domain components — `Hero`, `ServiceCard`, `TestimonialCard`, `FaqList`, `CtaBand`, `ContactBlock`

**Files:**
- Create: `src/components/{Hero,ServiceCard,TestimonialCard,FaqList,CtaBand,ContactBlock}.astro`

**Interfaces:**
- Produces:
  - `Hero.astro` props `{ headline: string; subhead?: string; ctaLabel?: string; ctaHref?: string }` + optional `image` slot.
  - `ServiceCard.astro` props `{ title: string; summary: string; icon: string; href: string }`.
  - `TestimonialCard.astro` props `{ author: string; role: string; quote: string; rating?: number }`.
  - `FaqList.astro` props `{ items: Array<{ question: string; body: string }> }` — native `<details>`.
  - `CtaBand.astro` props `{ heading: string; ctaLabel: string; ctaHref: string }`.
  - `ContactBlock.astro` — reads `site` for address/phone/email/hours + optional map slot.

- [ ] **Step 1: `Hero.astro`** (one H1 lives here on the homepage; `data-reveal` opt-in)

```astro
---
import Button from './Button.astro';
interface Props { headline: string; subhead?: string; ctaLabel?: string; ctaHref?: string }
const { headline, subhead, ctaLabel, ctaHref } = Astro.props;
---
<section class="py-[--spacing-section]">
  <div class="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
    <div data-reveal>
      <h1 class="font-display text-4xl font-semibold text-balance sm:text-5xl">{headline}</h1>
      {subhead && <p class="mt-5 max-w-[52ch] text-lg text-text-muted">{subhead}</p>}
      {ctaLabel && ctaHref && <div class="mt-8"><Button href={ctaHref}>{ctaLabel}</Button></div>}
    </div>
    <div><slot name="image" /></div>
  </div>
</section>
```

- [ ] **Step 2: `ServiceCard.astro`**

```astro
---
import Card from './Card.astro';
import { Icon } from 'astro-icon/components';
interface Props { title: string; summary: string; icon: string; href: string }
const { title, summary, icon, href } = Astro.props;
---
<a href={href} class="block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
  <Card>
    <Icon name={icon} class="size-8 text-brand" />
    <h3 class="mt-4 font-display text-xl font-semibold">{title}</h3>
    <p class="mt-2 text-text-muted">{summary}</p>
  </Card>
</a>
```

- [ ] **Step 3: `TestimonialCard.astro`** (render rating as text/stars, tokens only)

```astro
---
import Card from './Card.astro';
interface Props { author: string; role: string; quote: string; rating?: number }
const { author, role, quote, rating } = Astro.props;
---
<Card>
  {rating && <p class="text-brand" aria-label={`${rating} out of 5`}>{'★'.repeat(rating)}</p>}
  <blockquote class="mt-2 text-lg">“{quote}”</blockquote>
  <footer class="mt-4 text-text-muted"><span class="font-medium text-text">{author}</span> · {role}</footer>
</Card>
```

- [ ] **Step 4: `FaqList.astro`** (native accordion, works no-JS)

```astro
---
interface Props { items: Array<{ question: string; body: string }> }
const { items } = Astro.props;
---
<div class="mx-auto max-w-2xl divide-y divide-line">
  {items.map((f) => (
    <details class="group py-4">
      <summary class="flex cursor-pointer items-center justify-between font-medium">{f.question}<span class="text-brand transition group-open:rotate-45">+</span></summary>
      <div class="mt-3 text-text-muted" set:html={f.body} />
    </details>
  ))}
</div>
```

- [ ] **Step 5: `CtaBand.astro`**

```astro
---
import Button from './Button.astro';
interface Props { heading: string; ctaLabel: string; ctaHref: string }
const { heading, ctaLabel, ctaHref } = Astro.props;
---
<section class="bg-brand text-brand-contrast">
  <div class="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-[--spacing-section] text-center">
    <h2 class="font-display text-3xl font-semibold text-balance sm:text-4xl">{heading}</h2>
    <Button href={ctaHref} variant="outline">{ctaLabel}</Button>
  </div>
</section>
```

> `CtaBand` sits on `bg-brand`; the outline button's `border-brand`/`text-brand` would be invisible.
> Provide an inverted variant path in composition (frontend-design) using tokens only — e.g. a
> `--color-brand-contrast` bordered button. Do NOT hardcode white; use the contrast token.

- [ ] **Step 6: `ContactBlock.astro`**

```astro
---
import { site } from '../config/site';
---
<div class="grid gap-8 sm:grid-cols-2">
  <div class="space-y-2">
    <p>{site.address.street}</p>
    <p>{site.address.locality}, {site.address.region} {site.address.postalCode}</p>
    <p><a href={`tel:${site.phone}`} class="text-brand hover:underline">{site.phone}</a></p>
    <p><a href={`mailto:${site.email}`} class="text-brand hover:underline">{site.email}</a></p>
    {site.hours.map((h) => <p class="text-text-muted">{h.days}: {h.opens}–{h.closes}</p>)}
  </div>
  <div class="min-h-48 rounded-[--radius-base] border border-line bg-surface-alt"><slot name="map" /></div>
</div>
```

- [ ] **Step 7: Gate + commit**

```bash
pnpm check && pnpm build
git add src/components
git commit -m "feat: domain components (Hero, ServiceCard, TestimonialCard, FaqList, CtaBand, ContactBlock)"
```

---

## Phase 5 — Contact form + edge function

### Task 11: Contact Pages Function (Turnstile verify + honeypot/timing + Resend)

**Files:**
- Create: `functions/api/contact.ts` (Cloudflare Pages Function → route `/api/contact`)
- Create: `src/lib/contact-validation.ts` (pure, testable spam checks)
- Test: `test/contact-validation.test.ts`, `test/contact-function.test.ts`

**Interfaces:**
- Consumes: env `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`.
- Produces:
  - `validateSubmission(fields, now): { ok: true } | { ok: false; reason: string }` — pure: honeypot empty + elapsed-time plausibility (`now - startedAt >= 3000ms`) + required fields present.
  - `onRequestPost(context): Response` — verifies Turnstile when a token is present; on no-JS path (no token) relies on `validateSubmission`; sends via Resend; returns JSON for the fetch path, or a redirect/HTML for the native path (detected via `Accept` header).

- [ ] **Step 1: Write failing validation test `test/contact-validation.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { validateSubmission } from '../src/lib/contact-validation';

const base = { name: 'Sam', email: 'sam@example.com', message: 'Hello there', website: '', startedAt: 0 };

describe('validateSubmission', () => {
  it('accepts a well-formed, unhurried submission', () => {
    expect(validateSubmission(base, 5000)).toEqual({ ok: true });
  });
  it('rejects a filled honeypot', () => {
    expect(validateSubmission({ ...base, website: 'spam' }, 5000).ok).toBe(false);
  });
  it('rejects an implausibly fast submission', () => {
    expect(validateSubmission(base, 1000).ok).toBe(false);
  });
  it('rejects a missing message', () => {
    expect(validateSubmission({ ...base, message: '' }, 5000).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify failure**

```bash
pnpm test test/contact-validation.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Write `src/lib/contact-validation.ts`**

```ts
export interface Submission {
  name: string;
  email: string;
  message: string;
  website: string; // honeypot — must be empty
  startedAt: number; // ms epoch when the form was rendered/opened
}

export function validateSubmission(f: Submission, now: number): { ok: true } | { ok: false; reason: string } {
  if (f.website.trim() !== '') return { ok: false, reason: 'honeypot' };
  if (now - f.startedAt < 3000) return { ok: false, reason: 'too-fast' };
  if (!f.name.trim() || !f.email.includes('@') || !f.message.trim()) return { ok: false, reason: 'incomplete' };
  return { ok: true };
}
```

- [ ] **Step 4: Run to verify pass**

```bash
pnpm test test/contact-validation.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write `functions/api/contact.ts`**

```ts
import { validateSubmission, type Submission } from '../../src/lib/contact-validation';

interface Env {
  TURNSTILE_SECRET_KEY: string;
  RESEND_API_KEY: string;
  CONTACT_TO_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
}

async function verifyTurnstile(token: string, secret: string, ip: string): Promise<boolean> {
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const data = (await res.json()) as { success: boolean };
  return data.success === true;
}

export const onRequestPost: (ctx: { request: Request; env: Env }) => Promise<Response> = async ({ request, env }) => {
  const form = await request.formData();
  const wantsJson = (request.headers.get('accept') ?? '').includes('application/json');
  const submission: Submission = {
    name: String(form.get('name') ?? ''),
    email: String(form.get('email') ?? ''),
    message: String(form.get('message') ?? ''),
    website: String(form.get('website') ?? ''),
    startedAt: Number(form.get('startedAt') ?? 0),
  };

  const fail = (msg: string, status = 400) =>
    wantsJson
      ? new Response(JSON.stringify({ ok: false, error: msg }), { status, headers: { 'content-type': 'application/json' } })
      : new Response(`<h1>Could not send</h1><p>${msg}</p><a href="/contact">Back</a>`, { status, headers: { 'content-type': 'text/html' } });

  const basic = validateSubmission(submission, Date.now());
  if (!basic.ok) return fail('Your message could not be validated.');

  const token = String(form.get('cf-turnstile-response') ?? '');
  if (token) {
    const ip = request.headers.get('cf-connecting-ip') ?? '';
    if (!(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, ip))) return fail('Verification failed.');
  }
  // No token → no-JS path: honeypot + timing already passed above.

  const sent = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: env.CONTACT_TO_EMAIL,
      reply_to: submission.email,
      subject: `Website enquiry from ${submission.name}`,
      text: `${submission.name} <${submission.email}>\n\n${submission.message}`,
    }),
  });
  if (!sent.ok) return fail('We could not send your message. Please call us.', 502);

  return wantsJson
    ? new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } })
    : new Response('<h1>Thank you</h1><p>We’ll be in touch shortly.</p><a href="/">Home</a>', { headers: { 'content-type': 'text/html' } });
};
```

- [ ] **Step 6: Write function integration test `test/contact-function.test.ts`** (Workers pool + mocked fetch)

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { onRequestPost } from '../functions/api/contact';

const env = { TURNSTILE_SECRET_KEY: 's', RESEND_API_KEY: 'r', CONTACT_TO_EMAIL: 'to@x.com', CONTACT_FROM_EMAIL: 'from@x.com' } as any;

function req(fields: Record<string, string>, accept = 'application/json') {
  const body = new FormData();
  Object.entries(fields).forEach(([k, v]) => body.set(k, v));
  return new Request('https://x/api/contact', { method: 'POST', body, headers: { accept } });
}

beforeEach(() => vi.restoreAllMocks());

describe('contact function', () => {
  it('rejects a filled honeypot without emailing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const res = await onRequestPost({ request: req({ name: 'A', email: 'a@b.com', message: 'hi there', website: 'x', startedAt: '0' }), env });
    expect(res.status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('sends via Resend on a valid no-token (no-JS) submission', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));
    const res = await onRequestPost({ request: req({ name: 'A', email: 'a@b.com', message: 'hi there', website: '', startedAt: '0' }), env });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it('rejects when Turnstile verification fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: false }), { status: 200 }));
    const res = await onRequestPost({ request: req({ name: 'A', email: 'a@b.com', message: 'hi there', website: '', startedAt: '0', 'cf-turnstile-response': 'tok' }), env });
    expect(res.status).toBe(400);
  });
});
```

> The valid-submission test uses `startedAt: '0'` with the real `Date.now()`, so the 3s timing
> check passes. Keep it that way (no fake timers needed).

- [ ] **Step 7: Run function tests**

```bash
pnpm test test/contact-function.test.ts
```

Expected: PASS (3 cases).

- [ ] **Step 8: Commit**

```bash
git add functions src/lib/contact-validation.ts test/contact-validation.test.ts test/contact-function.test.ts
git commit -m "feat: contact Pages Function with Turnstile, honeypot/timing, Resend"
```

### Task 12: `ContactForm.astro` (progressive enhancement)

**Files:**
- Create: `src/components/ContactForm.astro`

**Interfaces:**
- Consumes: `site.form` (endpoint, turnstileSiteKey). Posts to the Task 11 function.
- Produces: an accessible form that works no-JS (native POST) and, with JS, renders Turnstile +
  submits via `fetch` with inline success/error.

- [ ] **Step 1: Write `ContactForm.astro`**

```astro
---
import { site } from '../config/site';
import Button from './Button.astro';
---
<form id="contact" method="POST" action={site.form.endpoint} class="mx-auto grid max-w-xl gap-4">
  <input type="hidden" name="startedAt" value="" />
  {/* Honeypot — visually hidden, not display:none, so bots fill it */}
  <div class="absolute -left-[9999px]" aria-hidden="true">
    <label>Website<input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
  </div>
  <label class="grid gap-1">Name<input required name="name" autocomplete="name" class="min-h-11 rounded-[--radius-base] border border-line bg-surface px-3" /></label>
  <label class="grid gap-1">Email<input required type="email" name="email" autocomplete="email" class="min-h-11 rounded-[--radius-base] border border-line bg-surface px-3" /></label>
  <label class="grid gap-1">Message<textarea required name="message" rows="5" class="rounded-[--radius-base] border border-line bg-surface p-3"></textarea></label>
  <div class="cf-turnstile" data-sitekey={site.form.turnstileSiteKey}></div>
  <Button type="submit">Send message</Button>
  <p id="contact-status" role="status" aria-live="polite" class="text-text-muted"></p>
</form>
<script>
  const form = document.getElementById('contact') as HTMLFormElement;
  (form.elements.namedItem('startedAt') as HTMLInputElement).value = String(Date.now());
  // Load Turnstile only when JS is present (progressive enhancement).
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
  s.async = true;
  document.head.appendChild(s);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.getElementById('contact-status')!;
    status.textContent = 'Sending…';
    const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { accept: 'application/json' } });
    const data = await res.json().catch(() => ({ ok: false }));
    status.textContent = data.ok ? 'Thanks — we’ll be in touch shortly.' : 'Something went wrong. Please call us.';
    if (data.ok) form.reset();
  });
</script>
```

> `startedAt` is stamped client-side for the JS path. For the no-JS path it stays empty (`0`), so
> the 3s timing check effectively passes on genuine slow human submits; honeypot remains the primary
> no-JS defense. This is the accepted degrade per spec §3.

- [ ] **Step 2: Gate**

```bash
pnpm check && pnpm build
```

Expected: clean.

- [ ] **Step 3: Local function test** — run `npx wrangler pages dev dist` after a build (or `pnpm dev` with the function), submit the form, confirm the status message updates. (Full Turnstile + Resend needs real keys; verify the request reaches `/api/contact`.)

- [ ] **Step 4: Commit**

```bash
git add src/components/ContactForm.astro
git commit -m "feat: progressively-enhanced contact form"
```

---

## Phase 6 — Pages

> Each page: one H1, `<Base>` layout with SEO props, `--spacing-section` rhythm, alternating
> surface/surface-alt, exactly one primary CTA style. Invoke **frontend-design** for composition.

### Task 13: Home, About, Contact pages

**Files:**
- Create/replace: `src/pages/index.astro`
- Create: `src/pages/about.astro`, `src/pages/contact.astro`
- Create: `public/og-default.png` (placeholder), `public/favicon.svg` (if not present)

**Interfaces:**
- Consumes: collections (`getCollection`), all components, `site`.

- [ ] **Step 1: `index.astro`** (hero → featured services → testimonials → CTA → contact)

```astro
---
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import SectionHeading from '../components/SectionHeading.astro';
import ServiceCard from '../components/ServiceCard.astro';
import TestimonialCard from '../components/TestimonialCard.astro';
import CtaBand from '../components/CtaBand.astro';
import { site } from '../config/site';

const services = (await getCollection('services')).filter((s) => s.data.featured).sort((a, b) => a.data.order - b.data.order);
const testimonials = await getCollection('testimonials');
---
<Base title={site.name} description={site.description}>
  <Hero headline={site.tagline} subhead={site.description} ctaLabel="Get a quote" ctaHref="/contact" />
  <section class="bg-surface-alt py-[--spacing-section]">
    <div class="mx-auto max-w-6xl px-4">
      <SectionHeading eyebrow="What we do" heading="Services" />
      <div class="mt-10 grid gap-6 md:grid-cols-3">
        {services.map((s) => <ServiceCard title={s.data.title} summary={s.data.summary} icon={s.data.icon} href={`/services/${s.id}`} />)}
      </div>
    </div>
  </section>
  <section class="py-[--spacing-section]">
    <div class="mx-auto max-w-6xl px-4">
      <SectionHeading eyebrow="Reviews" heading="What our customers say" />
      <div class="mt-10 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => <TestimonialCard {...t.data} />)}
      </div>
    </div>
  </section>
  <CtaBand heading="Ready for reliable comfort?" ctaLabel="Contact us" ctaHref="/contact" />
</Base>
```

- [ ] **Step 2: `about.astro`** — one H1, company story via `SectionHeading` + `Prose`; single CTA to `/contact`.

- [ ] **Step 3: `contact.astro`** — one H1, `ContactBlock` + `ContactForm`:

```astro
---
import Base from '../layouts/Base.astro';
import SectionHeading from '../components/SectionHeading.astro';
import ContactBlock from '../components/ContactBlock.astro';
import ContactForm from '../components/ContactForm.astro';
---
<Base title="Contact" description="Get in touch for a quote or service call.">
  <section class="py-[--spacing-section]">
    <div class="mx-auto max-w-6xl px-4">
      <h1 class="font-display text-4xl font-semibold">Contact us</h1>
      <div class="mt-10 grid gap-12 lg:grid-cols-2">
        <ContactBlock />
        <ContactForm />
      </div>
    </div>
  </section>
</Base>
```

- [ ] **Step 4: Gate + commit**

```bash
pnpm check && pnpm build
git add src/pages/index.astro src/pages/about.astro src/pages/contact.astro public
git commit -m "feat: home, about, contact pages"
```

### Task 14: Services index + detail

**Files:**
- Create: `src/pages/services/index.astro`, `src/pages/services/[...slug].astro`

**Interfaces:**
- Consumes: `services` collection; `render()` for MDX body.

- [ ] **Step 1: `services/index.astro`** — one H1, grid of all services sorted by `order`.

- [ ] **Step 2: `services/[...slug].astro`** (static paths + rendered body)

```astro
---
import { getCollection, render } from 'astro:content';
import Base from '../../layouts/Base.astro';
import Prose from '../../components/Prose.astro';

export async function getStaticPaths() {
  const services = await getCollection('services');
  return services.map((s) => ({ params: { slug: s.id }, props: { service: s } }));
}
const { service } = Astro.props;
const { Content } = await render(service);
---
<Base title={service.data.title} description={service.data.summary}>
  <article class="py-[--spacing-section]">
    <div class="mx-auto max-w-6xl px-4">
      <h1 class="font-display text-4xl font-semibold">{service.data.title}</h1>
      <Prose><Content /></Prose>
    </div>
  </article>
</Base>
```

- [ ] **Step 3: Gate + commit**

```bash
pnpm check && pnpm build
git add src/pages/services
git commit -m "feat: services index and detail pages"
```

### Task 15: Blog index + detail + RSS + FAQ + 404

**Files:**
- Create: `src/pages/blog/index.astro`, `src/pages/blog/[...slug].astro`, `src/pages/rss.xml.ts`, `src/pages/404.astro`
- Modify: home or a dedicated section to surface `FaqList` (FAQ collection) — add to `about.astro` or a `/faq` anchor per composition.

**Interfaces:**
- Consumes: `posts` (draft-filtered in prod), `faq`, `@astrojs/rss`.

- [ ] **Step 1: `blog/index.astro`** — one H1, list non-draft posts sorted by `date` desc:

```astro
---
import { getCollection } from 'astro:content';
import Base from '../../layouts/Base.astro';
const posts = (await getCollection('posts', (p) => import.meta.env.PROD ? !p.data.draft : true))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
---
<Base title="Blog" description="Tips and guides from our team.">
  <section class="py-[--spacing-section]">
    <div class="mx-auto max-w-3xl px-4">
      <h1 class="font-display text-4xl font-semibold">Blog</h1>
      <ul class="mt-10 divide-y divide-line">
        {posts.map((p) => (
          <li class="py-6">
            <a href={`/blog/${p.id}`} class="font-display text-xl font-semibold hover:text-brand">{p.data.title}</a>
            <p class="mt-1 text-text-muted">{p.data.description}</p>
          </li>
        ))}
      </ul>
    </div>
  </section>
</Base>
```

- [ ] **Step 2: `blog/[...slug].astro`** — mirror the services detail pattern (`getStaticPaths` over non-draft posts, `render()`, `<Prose>`, one H1). Repeat the full code from Task 14 Step 2 adapted to `posts`.

- [ ] **Step 3: `rss.xml.ts`**

```ts
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../config/site';

export async function GET(context: { site: URL }) {
  const posts = (await getCollection('posts', (p) => !p.data.draft)).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
  return rss({
    title: site.name,
    description: site.description,
    site: context.site,
    items: posts.map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.date, link: `/blog/${p.id}` })),
  });
}
```

- [ ] **Step 4: `404.astro`** — one H1, friendly message + link home, wrapped in `<Base>`.

- [ ] **Step 5: Surface FAQ** — add a FAQ section (sorted by `order`) into `about.astro` (or a `/faq` route) using `FaqList`, passing `{ question, body: rendered html }`. Render each FAQ body via `render()` or `p.body` as needed.

- [ ] **Step 6: Gate + commit**

```bash
pnpm check && pnpm build
git add src/pages/blog src/pages/rss.xml.ts src/pages/404.astro src/pages/about.astro
git commit -m "feat: blog, RSS, FAQ surface, and 404"
```

---

## Phase 7 — Polish, docs, acceptance

### Task 16: Analytics slot, robots, docs, README

**Files:**
- Modify: `src/layouts/Base.astro` (conditional analytics script from `site.analytics`)
- Create: `public/robots.txt`, `docs/CLIENT-SETUP.md`, `README.md`

**Interfaces:**
- Consumes: `site.analytics`.

- [ ] **Step 1: Analytics slot in `Base.astro`** — before `</body>`:

```astro
{site.analytics.provider === 'plausible' && site.analytics.id && (
  <script is:inline defer data-domain={site.analytics.id} src="https://plausible.io/js/script.js"></script>
)}
```

(Only renders when configured; default `'none'` emits nothing — keeps zero third-party JS by default.)

- [ ] **Step 2: `public/robots.txt`**

```
User-agent: *
Allow: /
Sitemap: https://example.com/sitemap-index.xml
```

- [ ] **Step 3: `docs/CLIENT-SETUP.md`** — the per-client rebrand checklist (PLAN §8): fill `site.ts`; set `@theme` brand tokens (light + `--color-brand-dark`) + swap display font import; run frontend-design on tokens + Hero; replace content collections; swap `og-default.png`/favicon; set CF env vars (`TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`) + Turnstile site key in `site.ts`; connect Cloudflare Pages (build `pnpm build`, output `dist`).

- [ ] **Step 4: `README.md`** — project overview, dev commands, the `data-provider`/Turnstile/Resend form setup, dark-mode note, deploy steps.

- [ ] **Step 5: Gate + commit**

```bash
pnpm check && pnpm build
git add src/layouts/Base.astro public/robots.txt docs/CLIENT-SETUP.md README.md
git commit -m "docs: client setup, README, analytics slot, robots"
```

### Task 17: Acceptance verification pass

**Files:** none created — this task verifies the Definition of Done and fixes any failures inline.

- [ ] **Step 1: Full test + check + build**

```bash
pnpm test && pnpm check && pnpm build
```

Expected: all tests pass; `astro check` 0 errors; `build` 0 warnings.

- [ ] **Step 2: No hex in components/pages** (acceptance §5)

```bash
grep -rInE '#[0-9a-fA-F]{3,8}\b' src/components src/pages && echo 'FAIL: hex found' || echo 'PASS: no hex'
```

Expected: `PASS: no hex`. If any found, replace with the appropriate token and re-run.

- [ ] **Step 3: Client JS budget < 60KB gzipped** (acceptance §4)

```bash
find dist/_astro -name '*.js' -exec gzip -c {} \; | wc -c
```

Inspect per-file gzipped sizes (GSAP/ScrollTrigger/Lenis are dynamic chunks loaded on demand). Confirm the initial-load JS stays under 60KB gzipped; if over, audit eager imports.

- [ ] **Step 4: JS-disabled pass** — `pnpm build && npx wrangler pages dev dist`, disable JS: nav works, mobile `<details>` menu works, FAQ `<details>` works, contact form submits via native POST (redirect/HTML response), theme follows system preference.

- [ ] **Step 5: reduced-motion pass** — emulate `prefers-reduced-motion: reduce`: no Lenis smooth scroll, no reveals; content fully visible.

- [ ] **Step 6: WCAG AA both themes** — check text/token contrast pairs in light and dark (axe or manual). Fix any token that fails AA.

- [ ] **Step 7: JSON-LD validity** — run the rendered LocalBusiness JSON-LD through a schema validator; 0 errors.

- [ ] **Step 8: Rebrand smoke test** (acceptance §6) — temporarily change `--color-brand`, `--color-brand-dark`, and a `site.ts` fact; rebuild; confirm the site re-brands coherently in both themes with no component edits. Revert the experiment.

- [ ] **Step 9: Lighthouse** — build, serve, run Lighthouse mobile on `/`: confirm Performance ≥ 95, Accessibility ≥ 95, SEO 100. Address regressions.

- [ ] **Step 10: Commit any fixes**

```bash
git add -A
git commit -m "chore: acceptance pass — a11y, budget, no-hex, JSON-LD verified"
```

---

## Self-Review (completed by plan author)

- **Spec coverage:** Dark mode (Tasks 1, 5, 6) · CF Pages Function form + Turnstile + Resend + no-JS degrade (Tasks 11, 12) · static+edge (Task 0 wrangler, Task 11) · HVAC demo (Task 4) · motion discipline w/ reduced-motion (Task 8) · theming contract (Tasks 1, 9, 10) · site.ts single-source (Task 2) · content = one file (Tasks 3, 4) · SEO/JSON-LD/sitemap/RSS/robots (Tasks 5, 15, 16) · all components + pages from PLAN §2 tree (Tasks 5–15) · per-client docs (Task 16) · every acceptance criterion (Task 17). No gaps found.
- **Placeholder scan:** No "TBD/TODO-implement-later". Presentational composition is explicitly delegated to frontend-design with compilable skeletons + interfaces + gates (a deliberate, documented boundary per CLAUDE.md — not a placeholder). Tasks 13 Step 2, 14 Step 1, 15 Steps 2/4/5 describe pages that reuse fully-shown patterns; the referenced code exists in adjacent steps.
- **Type consistency:** `Site` shape (Task 2) is the single source consumed by jsonld (Task 5) and components; `Submission`/`validateSubmission` names match across Tasks 11 files; `toggleTheme`/`shouldAnimate`/`initMotion`/`buildLocalBusinessJsonLd` referenced consistently where produced.
