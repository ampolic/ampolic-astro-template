# Client Setup — Astro Business Starter Rebrand Checklist

Follow this checklist to rebrand the template for a new client. Each step is required only once per deployment.

## 1. Site Configuration

- [ ] Edit `src/config/site.ts`:
  - Fill `name`, `legalName`, `tagline`, `description`, `url`
  - Update `logo`, `email`, `phone`, `address`, `geo`
  - Set business hours in `hours`
  - Update `nav` links and `socials` (label, href, icon)
  - Set `form.recipientLabel` (e.g., "the Acme team")
  - Set `analytics.provider` (default `'none'` emits zero third-party JS; choose `'plausible'` or `'ga'` and provide `id`)
  - Set `form.turnstileSiteKey` (Cloudflare Turnstile site key for the contact form)
  - Set `credit` (agency attribution): `credit.enabled` renders a discreet "Site by …" link in
    the footer and a line in `humans.txt`. This is a **per-client agreement** — leave
    `enabled: false` unless the client has agreed to the credit.

## Legal setup

The `/privacy` and `/terms` pages are generated from the `legal` block in `src/config/site.ts`.
The text is a conservative **starting point**, not legal advice — the client is responsible for
reviewing both pages with their own counsel before launch.

- [ ] Fill the `legal` block in `src/config/site.ts`:
  - `businessLegalName` (registered entity), `contactEmail`, `effectiveDate`, `jurisdictionNote`
    (governing-law region for the terms page)
  - Confirm `formProcessor` names the service that actually delivers form submissions and links its
    real privacy policy
- [ ] Confirm the privacy page matches the services actually in use: the contact form fields
  (name, email, message), the form processor, the OpenStreetMap embed, Cloudflare hosting/Turnstile,
  and analytics only if enabled. Remove or amend any paragraph that no longer applies.
- [ ] If enabling analytics: prefer a **cookieless** provider (Cloudflare Web Analytics or Plausible).
  Set `legal.analyticsProvider` to the vendor's display name so the privacy page names it, and wire the
  tag via `analytics.provider` (Plausible) or `legal.analyticsSnippet` (custom cookieless tag).
  If the client insists on GA4 or ad pixels, a consent banner is likely required — that is **out of
  template scope**; handle it per client.
- [ ] Escalation — recommend the client consult a lawyer directly if the business is health-related,
  targets children, sells online, or runs email marketing. These carry obligations this template does
  not attempt to cover.
- [ ] The client accepts responsibility for the legal review of both the privacy and terms pages.

## Escalation & client FAQ

### If the client asks for an accessibility widget/overlay

Decline, and explain why. Canned response:

> This site is built accessible at the code level — WCAG 2.2 AA, tested with both
> automated tooling (axe on every page) and manual keyboard + screen-reader
> passes, and it responds to visitors' own OS-level preferences for contrast,
> reduced motion, and text size. That is what the standard requires and what
> courts and regulators actually evaluate.
>
> An overlay widget (accessiBe, UserWay, and similar) adds cost and a third-party
> script that tracks your visitors — which conflicts with the no-third-party
> privacy posture this site ships with. Overlays can interfere with the screen
> readers and assistive tech people already use, and they have shown up *in* ADA
> complaints rather than preventing them. They do not provide legal protection.
>
> If a visitor hits a specific barrier, they can report it via the contact on the
> accessibility statement page and we fix it at the source — a durable fix, not a
> layer painted on top.

This matches the standing policy in the root `CLAUDE.md` (Accessibility
discipline): no third-party overlays, no homegrown font-size / "colorblind mode"
toggles. Accessibility lives in the code and responds to real user preferences.

## 2. Visual Identity (@theme tokens)

- [ ] Edit `src/styles/global.css` (the `@theme` block):
  - Set `--color-brand` to the client's primary brand color (hex)
  - Set `--color-brand-dark` for dark mode (ensure ≥ WCAG AA contrast on light text)
  - Verify all neutrals (--color-surface, --color-surface-alt, --color-text, --color-text-muted, --color-line) match the brand's aesthetic
  - All radii and shadows should remain consistent across light/dark
- [ ] Swap fonts (only if the brand needs it) — Fontsource variable packages only, no font CDN:
  - The three fonts load as latin-subset `@font-face` rules in `src/layouts/Base.astro`
    (Archivo = display, Hanken Grotesk = body/UI, JetBrains Mono = the "readout" voice for
    facts/numbers). To swap one, change its `?url` import and the matching `@font-face`.
  - Update the corresponding `--font-display` / `--font-sans` / `--font-mono` token in the
    `@theme` block of `src/styles/global.css`.

## 3. Design Validation

- [ ] Run `/frontend-design` skill:
  - Review the Hero section with the new brand tokens
  - Validate light and dark mode contrast and visual hierarchy
  - Confirm the primary CTA style matches brand guidelines
- [ ] Verify mobile Lighthouse scores (after content):
  - Performance ≥ 95, Accessibility ≥ 95, SEO 100
  - Check no third-party JS loads (unless analytics.provider is set)

## 4. Content & Media

- [ ] Replace `public/og-default.png` with the client's OG image (1200×630px, includes logo/brand)
- [ ] Replace `public/favicon.svg` with the client's favicon (keep the embedded
  `prefers-color-scheme` block so the mark stays theme-aware)
- [ ] Regenerate the iOS home-screen icon after swapping the logo:
  `node scripts/gen-apple-touch-icon.mjs` (writes `public/apple-touch-icon.png`)
- [ ] Update content collections (via markdown):
  - `src/content/services/` — add/edit the client's service offerings
  - `src/content/testimonials/` — add client testimonials
  - `src/content/faq/` — add frequently-asked questions
  - `src/content/posts/` — add blog posts (optional)
- [ ] Verify all collection frontmatter (title, description, published date, etc.) matches content structure
- [ ] Local-SEO copy: the homepage H1/intro must name the city (from `site.ts` `city`), and each
  service page should name the areas served where it reads naturally — not stuffed. The footer
  "Serving:" line and JSON-LD `areaServed` are generated from `site.ts` `serviceAreas`.

## 5. Environment Variables (Cloudflare Pages)

Set these in the Cloudflare Pages project settings (do NOT commit to `.env` or `env.example`):

- [ ] `TURNSTILE_SECRET_KEY` — the Cloudflare Turnstile secret key (used to verify form submissions)
- [ ] `RESEND_API_KEY` — the Resend API key (used to send contact form emails)
- [ ] `CONTACT_TO_EMAIL` — the email address that receives form submissions (e.g., "hello@client.com")
- [ ] `CONTACT_FROM_EMAIL` — the sender email (must be verified in Resend; e.g., "noreply@client.com")

The contact form endpoint (`/api/contact`) is a Cloudflare Pages Function at `functions/api/contact.ts`. It:
  - Verifies the Turnstile token (if provided) against TURNSTILE_SECRET_KEY
  - Validates field presence and honeypot on no-JS fallback
  - Sends via Resend using RESEND_API_KEY and CONTACT_TO_EMAIL
  - Applies timing-based anti-spam to JS-stamped submits

## 6. Cloudflare Pages Deployment

- [ ] Connect the GitHub repository to Cloudflare Pages:
  - Framework preset: `Astro`
  - Build command: `pnpm build`
  - Build output directory: `dist`
- [ ] Ensure the Turnstile site key (in `site.ts`) matches the Turnstile project in Cloudflare
- [ ] Test the contact form end-to-end:
  - JS path: verify Turnstile challenge and email delivery
  - No-JS path: verify form gracefully submits (POST to /api/contact) and emails arrive
  - Honeypot field should remain hidden and empty on valid submissions

## 7. Dark Mode (System-Aware)

- [ ] Verify the theme toggle works in the header (toggles between light/dark)
- [ ] Check that the system theme is detected on first visit (via `prefers-color-scheme`)
- [ ] Confirm no flash of unstyled content (FOUC) on page load (the anti-FOUC script in Base.astro runs before paint)
- [ ] Test with `prefers-reduced-motion: reduce` enabled — all motion must be disabled

## 8. Pre-Launch Verification

- [ ] Run `pnpm check` — all type checks pass
- [ ] Run `pnpm build` — zero warnings, output in `dist/`
- [ ] Run `pnpm test` — all tests pass (if any exist)
- [ ] Grep `src/components src/pages` — no hardcoded hex colors, radii, or shadows (all must reference design tokens from @theme)
- [ ] Verify analytics slot:
  - If `provider: 'none'`, no third-party JS loads
  - If `provider: 'plausible'`, the Plausible script loads only when `id` is set
- [ ] Test form and navigation without JavaScript enabled (must remain fully functional)

## Search presence

Do these at launch so the business is discoverable and its listings agree with the site.
NAP = Name, Address, Phone — it must be **identical** everywhere it appears.

- [ ] **Google Search Console:** verify the domain (DNS TXT record), then submit the sitemap —
  `https://<domain>/sitemap-index.xml`. Confirm it reports the expected page count with no errors.
- [ ] **Google Business Profile:** claim and complete the listing — primary + secondary categories,
  hours, service area, phone, website link, and real photos. The NAP on GBP must match
  `src/config/site.ts` **exactly** (same street format, same phone format). A mismatch splits
  local ranking signals.
- [ ] **Bing Places** and **Apple Business Connect:** create/claim the listing on both, with the
  same NAP, categories, hours, and website link.
- [ ] Confirm `robots.txt` (generated) points at the live sitemap and that `llms.txt` renders at
  `https://<domain>/llms.txt`.
- [ ] **Schedule a 30-day post-launch Search Console review:** check indexed-page coverage, top
  queries, and any crawl or structured-data errors, and fix what surfaced.

## 9. Go Live

- [ ] Final Lighthouse audit on production
- [ ] Set canonical URLs to the client's live domain (not `example.com`)
- [ ] Update any remaining placeholder text or links
- [ ] Brief the client on theme toggle, contact form, and analytics dashboard access
- [ ] Complete `docs/PRE-LAUNCH-CHECKLIST.md` before DNS cutover
