# Summit HVAC — Demo Site Visual Design

> Design spec for the `astro-business-starter` demo site. This is the reference
> the theming work implements against. Scope is strictly the theming surface
> defined by the theming contract in `CLAUDE.md`: the `@theme` token block in `src/styles/global.css`,
> the Fontsource font imports in `Base.astro`, and hero/section composition.
> Component internals are **not** in scope.
>
> Demo brand: **Summit Heating & Air** — licensed HVAC, Boulder CO.

---

## 1. Aesthetic direction (committed)

**Confident modern utility:** an instrument-grade HVAC site — cool teal-tinted
neutrals, tight grotesque headlines, and a monospace "readout" voice for every
fact and number — so the page feels *measured and engineered*, the deliberate
opposite of the royal-blue-gradient, grinning-technician, giant-yellow-emergency
-button franchise template.

**3-second feeling:** *"these people are precise and know exactly what they're
doing."*

---

## 2. Font pairing (Fontsource variable packages)

All self-hosted variable fonts. None from the excluded set (Inter, Roboto,
Arial, Space Grotesk). Verified present on npm (@5.2.x).

| Role | Package | CSS family | Used for |
|---|---|---|---|
| Display | `@fontsource-variable/archivo` | `'Archivo Variable'` | headlines, wordmark; tight, uppercase-strong |
| Body / UI | `@fontsource-variable/hanken-grotesk` | `'Hanken Grotesk Variable'` | body copy, buttons, nav; neutral, a touch warmer than Inter |
| Mono | `@fontsource-variable/jetbrains-mono` | `'JetBrains Mono Variable'` | **the signature** — eyebrows, spec numbers, phone, license #, ratings |

`Base.astro` loads these as latin-subset `@font-face` rules (via `?url` asset imports),
so only the three latin woff2 files ship to the browser:

```ts
import archivoLatin from '@fontsource-variable/archivo/files/archivo-latin-wght-normal.woff2?url';
import hankenLatin from '@fontsource-variable/hanken-grotesk/files/hanken-grotesk-latin-wght-normal.woff2?url';
import monoLatin from '@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2?url';
// …then declared as @font-face for 'Archivo Variable' / 'Hanken Grotesk Variable' / 'JetBrains Mono Variable'
```

> **Why a mono is a first-class font here:** the whole direction rests on
> treating facts as instrument readouts. The mono is not decoration — it is the
> voice for anything measurable. This requires a **new `--font-mono` token**
> (the template ships only `--font-display` / `--font-sans`).

---

## 3. `@theme` token values

Light is the default. Dark is tuned and wired through the existing `[data-theme]` remap. Exact hex is
AA-verified at implementation; values below are the design target.

### Fonts
```css
--font-display: 'Archivo Variable', sans-serif;
--font-sans:    'Hanken Grotesk Variable', sans-serif;
--font-mono:    'JetBrains Mono Variable', ui-monospace, monospace; /* new token */
```

### Color + shape (light default)

| Token | Value | Reasoning |
|---|---|---|
| `--color-brand` | `#0C6E6D` | deep teal — reads as air/climate/cool precision; hardest possible break from competitor royal blue. AA on `surface` and as a fill behind white label text. |
| `--color-brand-dark` | `#2DD4BF` | bright teal for dark mode; AA on dark surfaces. |
| `--color-brand-contrast` | `#FFFFFF` | text/icons on a teal fill. |
| `--color-surface` | `#FAFBFB` | cool near-white with a faint blue-grey cast, not pure white. |
| `--color-surface-alt` | `#EEF1F1` | cooler grey alternating band; echoes the teal family. |
| `--color-text` | `#14201F` | near-black carrying a **faint teal-green undertone** — quiet cohesion, never pure neutral. |
| `--color-text-muted` | `#4B5857` | cool slate; AA on both surfaces. |
| `--color-line` | `#D6DCDB` | cool hairline — borders, not shadows, do the structural work. |
| `--radius-base` | `0.25rem` | 4px — crisp and engineered, rejects the pillowy `rounded-2xl` default. |
| `--shadow-card` | `0 1px 2px rgb(16 40 40 / 0.05)` | near-zero; hairline borders carry separation. |
| `--spacing-section` | `clamp(2.25rem, 4.5vw, 3.75rem)` | compact vertical rhythm. |

### Color (dark override — same token names)

| Token | Value |
|---|---|
| `--color-brand` | `#2DD4BF` (= `--color-brand-dark`) |
| `--color-brand-contrast` | `#06201F` (dark ink on bright-teal fills) |
| `--color-surface` | `#0B1413` (dark, teal-tinted — **not** pure black) |
| `--color-surface-alt` | `#12201F` |
| `--color-text` | `#EAF0EF` |
| `--color-text-muted` | `#94A4A2` |
| `--color-line` | `#23302F` |
| `--shadow-card` | `0 1px 3px rgb(0 0 0 / 0.5)` |

**Cohesion rule:** neutrals are never pure grey/black — every surface and text
value carries a faint teal-green undertone so the palette reads *tuned* rather
than defaulted.

---

## 4. Hero concept — "the instrument panel"

Full-viewport, left-weighted, asymmetric. **A single real work photo carries the
hero** — a technician charging a condenser with a manifold gauge in frame — sitting
full-bleed behind a teal-ink scrim gradient, with the readout text riding on the
scrim in near-white so it always clears AA. Not a grinning-salesperson stock shot.

> Decision note: an earlier draft of this spec called for a *purely typographic*
> hero. The shipped homepage uses the full-bleed photo above by project decision;
> the `--color-scrim` / `--color-on-hero` tokens exist precisely to keep overlaid
> text legible. Do not "restore" the typographic hero without a new decision.

```
LICENSED HVAC · BOULDER, CO                      ← mono eyebrow, teal
Comfort, engineered.                             ← Archivo, tight tracking, 2-line clamp
Licensed HVAC for the Front Range — AC,          ← Hanken subhead (site.description)
heating, and indoor air quality.
[ Get a quote ]   ( 303 ) 555-0142               ← teal-fill CTA + ghost; phone in mono
──────────────────────────────────────────────
EST. 2009 · RATED 4.9/5 312 rev · LIC #EA-4471 · 24/7 DISPATCH   ← spec strip (mono)
```

- **Headline** is composed in `index.astro` (currently `"{city} heating & air
  conditioning, engineered for comfort."`); the terse `site.tagline`
  (`"Comfort, engineered."`) is reused elsewhere. Archivo, tight tracking.
- **Contrast is guaranteed by the scrim**, not by luck: the `--color-scrim`
  gradient + `--color-on-hero` text tokens (see `Hero.astro`) keep the eyebrow,
  headline, subhead, and CTA AA over any photo. The photo loads via `astro:assets`
  with explicit dimensions and `fetchpriority="high"`.
- The **spec strip** is a separate full-width band immediately below the hero
  (§5.2), composed on the page (not inside `Hero.astro`) so components stay clean.

---

## 5. Homepage composition (section by section)

Order: hero → services → social proof → CTA → contact.

1. **Hero** — full-bleed photo + teal-ink scrim (not a surface band). As §4.
2. **Spec / trust strip** — thin full-width band, monospace metrics row
   (`EST · rating-as-fraction · license · dispatch`; the rating is set `4.9/5`,
   never a `★` glyph — the mono face has no star and §7 rejects gold stars).
   This *replaces* the badge-soup logo
   wall and the giant yellow "24/7 EMERGENCY" button entirely.
3. **Services** — on `--color-surface-alt`. `SectionHeading` with mono eyebrow
   `WHAT WE DO` + Archivo heading "Services". Three `ServiceCard`s: hairline
   border, teal icon, and a **mono index `01 / 02 / 03`** in the corner — a
   spec-sheet catalog, not soft feature cards.
4. **Social proof** — on `--color-surface`. Mono eyebrow `IN THEIR WORDS`.
   Rating rendered as a mono fraction **`4.9 / 5.0`**, never a gold-star row;
   attribution name set in mono caps, role in muted Hanken.
5. **CtaBand** — full-width **teal** fill (`--color-brand` background,
   `--color-brand-contrast` text), with a mono sub-label + phone number.
   Copy direction: *"Ready when your system isn't."*
6. **Contact strip** — compact `address · hours · phone` in mono, an
   "operations / dispatch" register, closing the page.

Section rhythm alternates `surface` / `surface-alt` with `--spacing-section`
padding throughout.

---

## 6. Motion treatment

Implemented only in `src/scripts/motion.ts` (GSAP + Lenis), inside the ≤0.6s,
enter-only floor.

- **Character:** mechanical, precise, **no bounce/overshoot**.
- **Reveal:** rise `12px` + fade, duration `0.45s`, easing
  `cubic-bezier(.22, 1, .36, 1)` (crisp deceleration — a mechanical settle).
- **Stagger:** grids stagger children `60ms`. The **spec-strip metrics tick in
  one after another like readouts powering on** — the signature motion beat.
- **Hero sequence:** headline → subhead → CTA → spec strip, `80ms` apart.
- **Scroll:** Lenis smooth-scroll on; **fully disabled** and all content
  visible under `prefers-reduced-motion`. Site is complete with zero JS.
- **Focus ring:** 2px teal outline, 2px offset — visible and crisp; 44px min
  tap targets.

---

## 7. Three things this design deliberately does that a generic AI site wouldn't

1. **Monospace as a functional UI voice.** Every fact and number — eyebrows,
   phone, license #, ratings-as-fractions, service index numbers — is set as an
   instrument readout. Generic sites use one sans for everything and a row of
   gold stars.
2. **A terse spec strip instead of badge-soup.** Credibility is expressed as a
   single mono data row (`EST · rating · license · dispatch`), replacing the
   certification-logo wall and the giant yellow "24/7 EMERGENCY" button that
   every HVAC template ships.
3. **Hairline-and-tick precision with teal-tinted neutrals.** 4px radius, 1px
   borders, near-zero shadows, numbered cards, and a faint teal-green undertone
   threaded through every text/surface value so the palette reads *tuned*. A
   deliberate rejection of the `rounded-2xl` + drop-shadow + blue-gradient combo
   that signals "AI template."

---

## Rebrand contract (unchanged)

Everything above is expressed through `@theme` tokens + three font imports +
hero/section composition. Swapping brand color, the three font packages, and the
`site.ts` facts yields a coherent, differently-branded site with zero component
changes — the template's core promise.
