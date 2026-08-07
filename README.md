# ampolic-astro-template

The foundation template for **Ampolic Digital Solutions** client sites. A fast, accessible, themeable static website template for small businesses, built with
Astro 5, Tailwind CSS v4, and Cloudflare Pages. **Zero third-party JavaScript by
default**, and every visual choice lives in design tokens so a rebrand is essentially a
one-file edit.

The repo ships a complete demo brand — **Summit Heating & Air**, a fictional Boulder, CO
HVAC company — so it demonstrates convincingly out of the box.

- **Preview:** `dev` direct-uploads to `https://dev.ampolic-astro-template.pages.dev`
- **Production:** `main` direct-uploads to `https://ampolic-astro-template.pages.dev`
- **CMS:** Sveltia at `/admin`, committing authorized edits to `dev`

## Stack

- **Astro 5** — static output (`output: 'static'`), pure `.astro` components (no React/Vue/Svelte)
- **Tailwind CSS v4** — CSS-first theming via the `@theme` block in `src/styles/global.css`
  (through `@tailwindcss/vite`; no `tailwind.config.js`)
- **Fonts** — self-hosted Fontsource variable fonts, latin subset: **Archivo** (display) ·
  **Hanken Grotesk** (body/UI) · **JetBrains Mono** (the "readout" voice for facts & numbers).
  No font CDN.
- **GSAP + Lenis** — subtle enter-only motion + smooth scroll, all via `src/scripts/motion.ts`,
  fully disabled under `prefers-reduced-motion`
- **astro-icon + Lucide** — build-time inlined SVG icons
- **Cloudflare Pages** — static host; the contact form is a Pages Function (`functions/api/contact.ts`)
- **Resend** (transactional email) + **Cloudflare Turnstile** (privacy-first anti-spam)

Also included: light/dark theming, native cross-document View Transitions, a print
stylesheet, LocalBusiness JSON-LD, generated `sitemap` / `robots.txt` / `llms.txt` /
`security.txt` / `humans.txt`, a build-time OG-image endpoint, and an axe-core
accessibility test suite.

No third-party analytics by default. Optionally enable Plausible or GA via `site.analytics`
in `src/config/site.ts`.

## Generating a client site

**No blog needed?** Most client sites skip it — run `node scripts/remove-blog.mjs`
right after generation to strip the blog/RSS/OG-post surface (~760 LOC). Content
collections and Sveltia remain; only the `posts` collection goes.

This repo is a **GitHub template**. To spin up a new client site:

1. GitHub → "Use this template" → create `ampolic/client-<name>` (with all branches).
2. Clone, check out `dev`, and rebrand per `docs/CLIENT-SETUP.md`.
3. Wire Sveltia CMS: set `repo:` in `public/admin/config.yml` to the new repo (backend
   stays `github`, branch stays `dev`) — setup steps are in that file's header.
4. Provision the Pages project through `ampolic-core/infra`, then configure the generated
   repository's reusable CI for Wrangler direct upload: `main` = production, `dev` = preview.

## Branch model

Two permanent branches, in every Ampolic repo:

- **`dev`** — default working branch; all commits (agents, CMS) land here; deploys to staging.
- **`main`** — production, protected; only updated via a `dev` → `main` PR merged by a human.

No feature branches. CI (`.github/workflows/ci.yml`) runs authenticated install → check → test →
build, then deploys by Wrangler direct upload on pushes: `dev` is preview and `main` is production.
Pull requests build and test without deploying.

## Getting started

Prerequisites: Node.js 22+ (see `.nvmrc` / `engines`) and pnpm.

Shared components come from **`@ampolic/ui`** on GitHub Packages, which requires
auth even for installs: add `//npm.pkg.github.com/:_authToken=<PAT read:packages>`
to your user `~/.npmrc` (CI uses `NODE_AUTH_TOKEN`). The repo `.npmrc` already
maps the `@ampolic` scope to the registry.

```bash
pnpm install
pnpm dev          # dev server → http://localhost:4321
pnpm check        # astro check (strict TS)
pnpm build        # production build → dist/
pnpm preview      # serve the built site
pnpm test         # unit tests (vitest)
pnpm test:a11y    # accessibility tests (Playwright + axe, every page)
pnpm format       # prettier
```

## Project structure

```
src/
  components/         # .astro components (Header, Footer, Hero, SEO, ShareMenu, …)
  config/site.ts      # ALL business facts: name, nav, contact, hours, socials, analytics, legal, credit
  content/            # content collections: pages, posts, services, testimonials, faq
  content.config.ts   # collection definitions (schemas in content/schemas.ts, Zod-validated)
  layouts/Base.astro  # shell: font @font-face, <head>, anti-FOUC theme script, Header/Footer
  lib/                # helpers (jsonld, posts, share, readingTime, contact-validation)
  pages/              # routes + generated endpoints: robots.txt.ts, llms.txt.ts, rss.xml.ts,
                      #   .well-known/security.txt.ts, humans.txt.ts, og/[slug].png.ts (sitemap via integration)
  scripts/            # motion.ts (GSAP+Lenis), theme.ts, prefersReducedMotion.ts
  styles/global.css   # Tailwind entry + @theme tokens (colors, radii, shadows, fonts) + print + view-transitions
public/               # favicon.svg (theme-aware), favicon.ico, apple-touch-icon.png, og-default.png,
                      #   _headers, _redirects, rss.xsl
public/admin/         # Sveltia CMS (git-based; commits content to dev — see config.yml header)
functions/api/        # Cloudflare Pages Functions (contact.ts)
scripts/              # build tooling (remove-blog.mjs, gen-brand-icons.mjs)
tests/                # a11y.spec.ts + unit tests
docs/                 # DESIGN.md, CLIENT-SETUP.md, PRE-LAUNCH-CHECKLIST.md, IMAGE-CREDITS.md
CLAUDE.md             # short agent rules (branch model, layout, prohibitions) → links to docs/
docs/AGENT-GUARDRAILS.md  # the full working guardrails (stack, theming, a11y/SEO/privacy)
```

## Theming

All visual identity lives in **two** places, so a rebrand touches nothing else:

1. **`src/styles/global.css`** — the `@theme` block: `--color-brand` (+ `--color-brand-dark`
   for dark mode), the neutral surface/text/line tokens, `--color-scrim` / `--color-on-hero`
   (text over hero photos), `--radius-base`, `--shadow-card`, `--spacing-section`, and the
   `--font-display` / `--font-sans` / `--font-mono` families.
2. **`src/layouts/Base.astro`** — the three Fontsource `@font-face` imports.

Components reference tokens only — never hardcoded hex, radii, or shadows. The full
discipline lives in **`docs/AGENT-GUARDRAILS.md`**; the demo brand's visual direction is in
**`docs/DESIGN.md`**.

### Light & dark mode

System-aware: detects `prefers-color-scheme` on first visit, toggles from the header
(stored in `localStorage`), and avoids FOUC (an inline `<script>` sets `data-theme` before
paint). Dark mode remaps the same token names, so components never branch. All motion is
disabled under `prefers-reduced-motion`.

## Content model

Five Zod-validated collections in `src/content/` (schemas in `content/schemas.ts`),
shaped to receive WordPress-export markdown (pages + posts) directly:

- **pages** — `title`, `description`, `date?`, `updated?`, `draft`, body — rendered
  at `/<slug>` by `src/pages/[...page].astro` (static routes always win on collision)
- **services** — `title`, `summary`, `description?`, `icon` (Lucide name), `order`,
  `featured`, optional `image` + `imageAlt`, body
- **posts** — `title`, `description`, `date`, `updated?`, `tags`, `draft`, `cover?`, body
- **testimonials** — `author`, `role`, `quote`, `rating?`
- **faq** — `question`, `order`, body

Adding a service/post/testimonial/FAQ is a single new markdown/MDX file — no code changes.

## Contact form

`/contact` posts to `/api/contact`, a Cloudflare Pages Function (`functions/api/contact.ts`).

- **With JS:** Turnstile CAPTCHA (verified server-side against `TURNSTILE_SECRET_KEY`), a
  timing check, and a honeypot.
- **Without JS:** the form still POSTs; the function validates field presence + honeypot.
  Fully functional with JavaScript disabled.

Set these in the Cloudflare Pages project settings (never commit them):

```
TURNSTILE_SECRET_KEY   RESEND_API_KEY   CONTACT_TO_EMAIL   CONTACT_FROM_EMAIL
```

## Deployment (Cloudflare Pages)

Framework preset **Astro**, build command `pnpm build`, output directory `dist`. Add the env
vars above. The `functions/` directory deploys automatically as Pages Functions.

Before shipping a client, work through **`docs/PRE-LAUNCH-CHECKLIST.md`** (automated gates,
manual accessibility pass, SEO, and legal).

## Rebranding for a client

See **`docs/CLIENT-SETUP.md`** — the step-by-step rebrand checklist: site config, brand
tokens, fonts, content, media, Cloudflare env, and search presence.

## License

MIT
