# Design Spec: `astro-business-starter` (pressure-tested)

**Date:** 2026-07-09
**Status:** Approved — ready for implementation planning
**Base document:** [`PLAN.md`](../../../PLAN.md) — the locked build plan. This spec records the
decisions from a pressure-test pass over PLAN and is authoritative where the two differ.

---

## 1. Summary

An opinionated, reusable static Astro 5 template for small-business websites: clean, fast,
professional, client-themeable via a single `@theme` token block. Markdown-first content,
deployed to Cloudflare Pages. This spec accepts PLAN.md wholesale **except** for the four
deltas below, which came out of a deliberate pressure-test.

### Deltas vs PLAN.md (authoritative)

| Area | PLAN.md | This spec |
|---|---|---|
| Dark mode | Out of scope (§10) | **In scope** — full toggle, system-aware, persisted |
| Contact form | Static + 3rd-party endpoint, honeypot, no CAPTCHA (§6) | **Cloudflare Pages Function** + Turnstile + Resend, with a no-JS graceful degrade |
| Static promise | "pure static" | "static + one edge function" (Astro output stays `static`) |
| Demo business | "fictional business" (unnamed) | **Home services / HVAC** — *Summit Heating & Air* |

**Unchanged from PLAN.md** (still authoritative there): stack (Astro 5 static, Tailwind v4 via
`@tailwindcss/vite`, pure `.astro`, no framework), motion stack (**GSAP + ScrollTrigger + Lenis**,
kept intentionally), content model (Content Collections, **MDX**, Zod), blog + RSS, fonts
(Fontsource variable), icons (`astro-icon` + lucide), theming contract, file tree, per-client
workflow, and the design quality floor.

---

## 2. Dark mode

The template's core thesis is "rebrand by swapping `@theme` tokens." Dark mode is nearly free
when designed into that token layer from day one and a painful retrofit later — so it ships in v1.

**Token layer**
- Keep the semantic token set (`--color-surface`, `--color-surface-alt`, `--color-text`,
  `--color-text-muted`, `--color-line`) defined for light in `:root`.
- Add a dark override applied under **both** `@media (prefers-color-scheme: dark)` **and**
  `:root[data-theme="dark"]`, so an explicit user choice always beats the system default and a
  system default applies when no choice is stored.
- Add a `--color-brand-dark` slot: still a single brand color, just a dark-tuned value so the
  brand stays WCAG AA on dark surfaces. Components reference the brand token; the dark override
  remaps it.

**Anti-FOUC**
- A single tiny **blocking inline script** in `<head>` (the only sanctioned render-blocking JS in
  the template): reads `localStorage.theme`, falls back to `prefers-color-scheme`, and stamps
  `data-theme` on `<html>` before first paint. No flash of the wrong theme.

**Toggle**
- `ThemeToggle.astro` in the header. Flips `data-theme` on `<html>` and writes `localStorage.theme`.
  Target ~0.5KB. Accessible: real `<button>`, `aria-label`, reflects current state.

**No-JS behavior**
- The toggle is inert; the site follows the system `prefers-color-scheme`. The base experience is
  complete either way.

**Testing**
- WCAG AA contrast is verified in **both** themes for every text/token combination.

---

## 3. Contact form (Cloudflare Pages Function)

Chosen for robust, inline UX and real spam protection. Astro still builds `output: 'static'`; the
form endpoint is a Cloudflare Pages Function deployed alongside the static assets. This softens the
"pure static" promise to "static + one edge function."

**Client (`ContactForm.astro`)**
- Accessible HTML form, correct labels/`autocomplete`, honeypot field.
- **With JS:** Turnstile widget renders and produces a token; submit via `fetch` to the function;
  render inline success/error; no page redirect.
- **Without JS:** native `POST` to the same function endpoint (no Turnstile token available).

**Function (`functions/contact.ts`)**
- If a Turnstile token is present → verify it server-side against the Turnstile secret.
- If absent (no-JS path) → fall back to honeypot check + a submission-timing heuristic (reject
  implausibly fast submits). Rate-limiting is optional and, because Pages Functions are stateless,
  would require Cloudflare KV — deferred unless spam proves it necessary. This keeps the form
  *functional* without JS, minus the Turnstile check.
- On pass → send the message via **Resend**.
- Response: JSON for the `fetch` (JS) path; a server-rendered thank-you / error HTML page for the
  native (no-JS) path.

**Config & secrets**
- `site.ts` holds the public shape: endpoint path, Turnstile **site** key, recipient label.
- Secrets live in Cloudflare env vars, documented in README + `wrangler.toml`: Turnstile **secret**
  key, Resend API key, destination email address.

**Contract notes**
- `PLAN §9.3` ("form works without JS") holds in spirit: the form still submits and delivers
  without JS; only the Turnstile challenge is skipped on that path.
- `PLAN §6` ("no CAPTCHA") is intentionally superseded — Turnstile is a low-friction,
  privacy-respecting challenge, chosen for spam robustness.

**Delivery provider:** default **Resend** (confirm at review; the function isolates the send call
so swapping providers is a one-file change).

---

## 4. Demo content — home services / HVAC

The starter's own demo identity; each real client swaps it out via `site.ts` + content collections.

- **Business:** *Summit Heating & Air* — a fictional single-location, service-area HVAC company.
  Drives the LocalBusiness JSON-LD (name, address, phone, hours, geo, `sameAs` socials).
- **Services (3):** AC repair & install; furnace / heating; indoor air quality.
- **Testimonials (3):** realistic local-customer quotes with name + role/context.
- **FAQ (4):** financing, service area, emergency/after-hours availability, maintenance plans.
- **Posts (2):** seasonal tune-up tips; how to choose a new system.
- **Aesthetic seed** (handed to the frontend-design skill within token guardrails): trustworthy,
  clean, calm; one confident brand color (blue/teal family). Final direction is the skill's call.

---

## 5. Motion discipline (holding 60KB with GSAP + Lenis in)

GSAP + ScrollTrigger + Lenis stay (~37KB gzip) per PLAN. To keep the ≤60KB client-JS budget and
the "fast and calm / no scroll-jacking" bar honest, these constraints are explicit:

- All motion routed through `src/scripts/motion.ts`.
- `prefers-reduced-motion: reduce` **fully disables Lenis** (revert to native scroll) *and* skips
  GSAP reveals entirely — not merely shortens them.
- Reveals are enter-only fade/rise, ≤0.6s. No pinning, no scrub-tied ScrollTrigger.
- Everything else — nav, mobile menu, FAQ accordion, theme toggle — stays native / near-zero JS so
  the ~37KB animation budget doesn't blow the 60KB ceiling. This is tracked as an explicit budget
  line item.

---

## 6. Updated acceptance criteria

Supersedes/extends PLAN §9:

1. `pnpm build` zero warnings; `astro check` clean (strict TS).
2. Lighthouse mobile on `/`: Performance ≥ 95, Accessibility ≥ 95, SEO 100.
3. Site usable with JavaScript disabled — nav, FAQ, and contact form all function (form submits &
   delivers; Turnstile check skipped on the no-JS path). Theme toggle inert, system preference honored.
4. `prefers-reduced-motion` honored (Lenis + GSAP both off); total client JS < 60KB gzipped.
5. No hardcoded colors/radii/shadows outside `@theme`; grep confirms no hex in `src/components` or
   `src/pages`.
6. Rebrand test: changing only `site.ts` + `@theme` (incl. dark tokens + `--color-brand-dark`) +
   font import yields a coherent, differently-branded site in **both** light and dark.
7. WCAG AA contrast verified in **both** light and dark themes.
8. New service/post/testimonial = one markdown/MDX file, zero code changes.
9. Valid LocalBusiness JSON-LD (schema validator).
10. Contact form: Turnstile verified server-side on the JS path; honeypot + timing fallback on the
    no-JS path; delivery via Resend; secrets in CF env vars, not committed.

---

## 7. Out of scope (v1)

Per PLAN §10, minus dark mode (now in) and the static-only form (now an edge function). Still out:
booking/scheduling widgets, e-commerce, i18n, CMS UI, analytics beyond a script slot in `site.ts`,
multi-location schema.
