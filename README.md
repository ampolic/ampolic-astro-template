# Astro Business Starter

A modern, fast, and themeable static business website template built with Astro 5, Tailwind CSS v4, and Cloudflare. Zero third-party JavaScript by default; all motion via GSAP + Lenis; contact form with anti-spam (Turnstile + Resend).

## Stack

- **Astro 5** — static site generation with `.astro` components (no React/Vue/Svelte)
- **Tailwind CSS v4** — CSS-first theming via `@theme` block in `src/styles/global.css`
- **GSAP + Lenis** — scroll animation and smooth scrolling (via `src/scripts/motion.ts`)
- **Fontsource** — variable fonts (no external CDN; currently Inter + Manrope)
- **Cloudflare Pages** — deploy target; contact form via Pages Functions
- **Resend** — transactional email for contact submissions
- **Cloudflare Turnstile** — privacy-first CAPTCHA for form anti-spam

No third-party analytics by default. Optionally enable Plausible or Google Analytics via `site.analytics` in `src/config/site.ts`.

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (http://localhost:3000)
pnpm check            # Type check (astro check)
pnpm build            # Build for production (output: dist/)
pnpm test             # Run tests (if any)
```

### File Structure

```
src/
  components/         # .astro components (Header, Footer, SEO, etc.)
  config/site.ts      # Site metadata, nav, business facts, analytics config
  content/            # Content collections (services, testimonials, team, blog)
  layouts/Base.astro  # Main layout (includes anti-FOUC, analytics slot)
  pages/              # Route pages (.astro)
  scripts/motion.ts   # GSAP + Lenis initialization
  styles/global.css   # Global styles + Tailwind @theme block (all colors, radii, shadows)
public/
  favicon.svg         # Favicon (replace with client's)
  og-default.png      # OG image (replace with client's)
  robots.txt          # SEO robots directive
functions/api/        # Cloudflare Pages Functions (contact.ts)
docs/
  PLAN.md             # Project architecture and design decisions
  CLIENT-SETUP.md     # Per-client rebrand checklist
```

## Theming

All visual identity lives in two places:

1. **`src/styles/global.css`** — the `@theme` block:
   - `--color-brand` — primary brand color (light mode)
   - `--color-brand-dark` — brand color for dark mode
   - `--color-surface`, `--color-surface-alt` — backgrounds
   - `--color-text`, `--color-text-muted` — text colors
   - `--color-border` — border color
   - `--spacing-section` — vertical section rhythm
   - All border-radius and box-shadow values
   - Font families (currently `'Inter'` and `'Manrope'`)

2. **`src/layouts/Base.astro`** — font imports:
   - Display font: `@fontsource-variable/manrope` (replace for rebranding)
   - Body font: `@fontsource-variable/inter`

Components reference design tokens only; no hardcoded hex colors, radii, or shadows.

### Light & Dark Mode

The theme is system-aware by default:
- Detects `prefers-color-scheme: dark` on first visit
- User can toggle via the theme button in the header (stored in `localStorage`)
- No flash of unstyled content (FOUC) — an inline `<script>` in `<head>` sets `data-theme` before paint
- All motion is disabled under `prefers-reduced-motion: reduce`

## Contact Form

The contact form (at `/contact`) submits to the `/api/contact` endpoint, a Cloudflare Pages Function at `functions/api/contact.ts`.

### Anti-Spam Design

**With JavaScript:**
- Cloudflare Turnstile CAPTCHA (privacy-first, no data sale)
- Token sent to the backend and verified against `TURNSTILE_SECRET_KEY`
- Timing-based rate-limiting (minimum 1s between submit clicks)
- Honeypot field (hidden, should remain empty on valid submits)

**Without JavaScript (graceful fallback):**
- Form submits via POST with field-presence validation
- Honeypot remains hidden; timing-only check does not apply
- Backend verifies all required fields are present

### Environment Variables

Set these in Cloudflare Pages project settings (not committed):

```
TURNSTILE_SECRET_KEY    # Cloudflare Turnstile secret (verify tokens)
RESEND_API_KEY          # Resend API key (send emails)
CONTACT_TO_EMAIL        # Recipient email (e.g., hello@client.com)
CONTACT_FROM_EMAIL      # Sender email (must be verified in Resend)
```

## Analytics (Optional)

By default, `site.analytics.provider` is set to `'none'` — zero third-party JavaScript.

To enable analytics, update `src/config/site.ts`:

```typescript
analytics: {
  provider: 'plausible',  // or 'ga' or 'none'
  id: 'example.com'       // Plausible domain or GA property ID
}
```

The analytics script (if configured) loads in the `<body>` of `src/layouts/Base.astro`:

```astro
{site.analytics.provider === 'plausible' && site.analytics.id && (
  <script is:inline defer data-domain={site.analytics.id} src="https://plausible.io/js/script.js"></script>
)}
```

## Deployment

### Cloudflare Pages

1. Connect your GitHub repository to Cloudflare Pages
2. Set build settings:
   - **Framework:** Astro
   - **Build command:** `pnpm build`
   - **Build output directory:** `dist`
3. Add environment variables (see Contact Form section)
4. Deploy

The `functions/` directory is automatically deployed as Cloudflare Pages Functions.

### Build Verification

Before deployment:

```bash
pnpm check && pnpm build
```

Both must pass with zero warnings. Verify:
- Client-side JavaScript < 60KB gzipped
- Lighthouse (mobile): Performance ≥ 95, Accessibility ≥ 95, SEO 100
- No hardcoded colors in components/pages (all via @theme)
- Analytics script does not render by default (provider: 'none')

## Design Quality Standards

- **One H1 per page** — clear page hierarchy
- **Body text 16–18px, line-height ≥ 1.6, measure ≤ 70ch** — readable prose
- **Section rhythm** — alternating surface/surface-alt backgrounds with `--spacing-section` padding
- **Exactly one primary CTA per page** — obvious conversion path
- **WCAG AA contrast** — all text meets color contrast standards
- **Visible focus states** — keyboard navigation is clear and accessible
- **44px tap targets** — touch-friendly buttons and links
- **Motion ≤ 0.6s, enter-only, subtle** — no pinning, no scroll-jacking
- **No JavaScript required** — navigation, accordion, and contact form all work without JS

## For Clients

See `docs/CLIENT-SETUP.md` for the per-client rebrand checklist: updating site config, theming, content, media, environment variables, and Cloudflare deployment.

## License

MIT
