# Pre-Launch Checklist

Work through this top to bottom for every client before DNS cutover. Run the
commands — do not trust memory or a green build from last week. Check a box only
after you have personally seen the passing output or completed the manual step.

## Automated gates (run, don't trust memory)

- [ ] `pnpm check && pnpm build` — clean, zero warnings
- [ ] `pnpm test` — all unit tests pass
- [ ] `pnpm test:a11y` — zero axe violations on every page (desktop + mobile,
      including share popover and mobile nav open states)
- [ ] Lighthouse mobile on `/` and one blog post: Performance ≥ 95,
      Accessibility ≥ 95, SEO 100
- [ ] Third-party request audit: open DevTools → Network on the built site and
      list every external request it makes. Confirm it matches the privacy
      policy EXACTLY (default: form processor, Cloudflare hosting/Turnstile,
      OpenStreetMap embed — nothing else unless analytics is enabled)

## Manual accessibility pass (~20 min, cannot be automated)

- [ ] **Keyboard-only.** Unplug the mouse. Tab through every page: every link,
      button, and control is reachable, shows a visible focus indicator at every
      stop, and there are no focus traps. The share popover and the mobile nav
      open, operate, and close (Escape / toggle) by keyboard alone.
- [ ] **Screen reader spot-check** (NVDA, VoiceOver, or Orca). Navigate the
      homepage, open a FAQ item, and complete + submit the contact form. Labels,
      button purposes, and error messages are announced sensibly. Images convey
      meaning, not filename noise.
- [ ] **200% browser zoom** on every page: no horizontal scroll, no overlap,
      everything readable. Spot-check 400% reflow on the homepage.
- [ ] **`prefers-reduced-motion` enabled**: no animation plays; all content is
      fully visible and reachable.
- [ ] **OS high-contrast preference enabled** (or emulated via DevTools →
      Rendering → `prefers-contrast: more`): text, borders, and focus indicators
      are clearly strengthened; hero and CTA-band text stay legible; nothing
      breaks or overlaps.
- [ ] **Browser font size set to Large**: layout holds, no clipped or truncated
      text, no overlap.
- [ ] **Pinch zoom works** on a real mobile device (or emulation): the page can
      be zoomed and is not locked at scale 1.
- [ ] **JavaScript disabled**: nav, FAQ, share links, contact form, and the map
      fallback link are all usable.
- [ ] **Headings outline**: exactly one H1 per page, no skipped levels (check
      with a headings bookmarklet or the browser accessibility tree).
- [ ] **Link text is meaningful out of context** (no bare "click here" / "read
      more" with no surrounding cue).
- [ ] **Form errors are described in text**, not by colour alone.

## Content accessibility (client-supplied material)

- [ ] Every image has appropriate alt text; decorative images use `alt=""`.
- [ ] No text baked into images for essential info (hours, phone, address).
- [ ] Any PDFs are accessible, or have an HTML equivalent.
- [ ] Any video has captions.
- [ ] Testimonials are real, from real customers, used with permission.

## Legal / config

- [ ] `site.ts` `legal` block complete; `effectiveDate` and `lastReviewed` set
- [ ] Privacy, Terms, and Accessibility pages reviewed against the services
      actually in use; client informed to seek their own legal review
- [ ] `_redirects` in place for any long-form legal URLs the client expects

---

Once every box is checked, and only then, proceed to DNS cutover.
