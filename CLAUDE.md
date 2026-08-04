# ampolic-astro-template — agent rules

Astro 5 template for Ampolic client sites. Every client repo is generated from
this template. Staging = Cloudflare Pages `dev`, production = `main`.

## Branch rule (absolute)

Two permanent branches only. Agents commit ONLY to `dev`, never to `main`.
Humans merge `dev` -> `main` via PR. No feature branches.

## Layout

- `src/content/` — Zod-validated collections: pages, posts, services, testimonials, faq
  (schemas in `src/content/schemas.ts`; Decap CMS edits these on `dev`)
- `src/components/` — site-local `.astro` components only; shared ones will come
  from `@ampolic/ui` later (see `src/components/README.md`)
- `src/config/site.ts` — ALL business facts; `src/styles/global.css` — all theming tokens
- `public/admin/` — Decap CMS; `functions/api/` — Cloudflare Pages Functions
- `.github/workflows/ci.yml` — install, check, build on `dev` pushes and PRs to `main`

## Detailed rules

Full guardrails (stack, theming, a11y, SEO, privacy discipline): `docs/AGENT-GUARDRAILS.md`.
Knowledge base (workspace-relative paths; resolve once ampolic-core exists):

- Conventions: `../ampolic-core/kb/conventions/astro.md`
- Brand rules: `../ampolic-core/kb/brand/README.md`
- Component usage: `../ampolic-core/kb/components/README.md`
- Runbooks: `../ampolic-core/kb/runbooks/README.md`

## Agents must NOT

- Push directly to `main`
- Delete or rename content collections
- Touch backend settings in `public/admin/config.yml`
- Add dependencies without a TODO note flagging them for review

Verify before done: `pnpm check` && `pnpm build` (plus `pnpm test:a11y` for UI changes).
