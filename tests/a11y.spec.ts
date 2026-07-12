import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/*
 * Accessibility test suite. Two halves:
 *  1. Automated axe-core scans of every page in the sitemap, at desktop (1440)
 *     and mobile (375) widths, plus interactive OPEN states (share popover,
 *     mobile nav) that only exist in the rendered DOM after interaction.
 *  2. Keyboard-operability simulations for the interactive widgets.
 *
 * axe only sees the current DOM, so anything gated behind interaction must be
 * opened BEFORE scanning. Zero violations is the pass bar; "incomplete" results
 * (things axe can't decide) are printed as warnings for a human to review.
 */

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 },
] as const;

// WCAG 2.2 AA is the conformance target; best-practice adds landmark/heading hygiene.
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

// Populated once from the built sitemap in beforeAll; shared across the scan tests.
let PATHS: string[] = [];

/** Collect every page path from the built sitemap (sitemap-index → sub-sitemaps). */
async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const index = await (await request.get('/sitemap-index.xml')).text();
  const subMaps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const paths = new Set<string>();
  for (const sm of subMaps) {
    const xml = await (await request.get(sm)).text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) paths.add(new URL(m[1]).pathname);
  }
  return [...paths].sort();
}

interface Violation {
  where: string;
  id: string;
  impact: string | null | undefined;
  help: string;
  targets: string[];
}

/** Run an axe scan on the CURRENT DOM. Logs "incomplete" as warnings, returns violations. */
async function scan(page: Page, where: string): Promise<Violation[]> {
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
  for (const inc of results.incomplete) {
    for (const node of inc.nodes) {
      console.warn(`⚠ needs-review · ${where} · ${inc.id} · ${node.target.join(' ')}`);
    }
  }
  return results.violations.map((v) => ({
    where,
    id: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.map((n) => n.target.join(' ')),
  }));
}

function report(violations: Violation[]): string {
  if (violations.length === 0) return 'no violations';
  return violations
    .map((v) => `\n  ✗ [${v.impact}] ${v.where} · ${v.id}: ${v.help}\n      ${v.targets.join('\n      ')}`)
    .join('');
}

test.beforeAll(async ({ request }) => {
  PATHS = await sitemapPaths(request);
  expect(PATHS.length, 'sitemap should list at least the core pages').toBeGreaterThan(3);
});

test.describe('axe-core: sitemap crawl', () => {
  for (const vp of VIEWPORTS) {
    test(`zero violations @ ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const found: Violation[] = [];
      for (const path of PATHS) {
        await page.goto(path, { waitUntil: 'load' });
        found.push(...(await scan(page, `${path} @${vp.name}`)));
      }
      expect(found, report(found)).toEqual([]);
    });
  }
});

test.describe('axe-core: dark mode', () => {
  test('zero violations on / in dark theme', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/', { waitUntil: 'load' });
    const found = await scan(page, '/ @dark');
    expect(found, report(found)).toEqual([]);
  });
});

test.describe('axe-core: interactive open states', () => {
  test('share popover open (blog post)', async ({ page }) => {
    const post = PATHS.find((p) => /^\/blog\/[^/]+\/?$/.test(p) && !p.startsWith('/blog/tags'));
    test.skip(!post, 'no blog post in sitemap');
    await page.goto(post!, { waitUntil: 'load' });
    await page.locator('.share-trigger').click();
    await expect(page.locator('#share-panel')).toBeVisible();
    const found = await scan(page, `${post} (share popover open)`);
    expect(found, report(found)).toEqual([]);
  });

  test('mobile nav open @ 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'load' });
    await page.locator('header details summary').click();
    await expect(page.locator('header details[open] nav[aria-label="Mobile"]')).toBeVisible();
    const found = await scan(page, '/ (mobile nav open)');
    expect(found, report(found)).toEqual([]);
  });
});

/* ── Keyboard operability ─────────────────────────────────────────────────
   axe checks structure; these drive the keyboard the way a real user without a
   mouse would, asserting reachability, a visible focus indicator at every stop,
   and the expected open/operate/close behavior of each interactive widget. */

/** Does the currently focused element show a visible focus indicator? */
async function focusedHasIndicator(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return false;
    const s = getComputedStyle(el);
    const hasOutline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0;
    const hasShadow = s.boxShadow !== 'none' && s.boxShadow !== '';
    // Skip links reveal themselves (sr-only → visible) as their focus affordance.
    const revealsSelf = el.className.includes('sr-only');
    return hasOutline || hasShadow || revealsSelf;
  });
}

test.describe('keyboard: homepage', () => {
  test('every visible control is Tab-reachable with a focus indicator', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    // Tag every currently-visible interactive element so we can track coverage.
    const total = await page.evaluate(() => {
      const sel = 'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex]:not([tabindex="-1"])';
      const visible = [...document.querySelectorAll<HTMLElement>(sel)].filter((el) => {
        if (el.closest('[hidden]')) return false;
        const s = getComputedStyle(el);
        if (s.display === 'none' || s.visibility === 'hidden') return false;
        const r = el.getBoundingClientRect();
        return r.width > 0 && r.height > 0;
      });
      visible.forEach((el, i) => el.setAttribute('data-kbd', String(i)));
      return visible.length;
    });
    expect(total).toBeGreaterThan(0);

    const seen = new Set<number>();
    const noIndicator: string[] = [];
    for (let i = 0; i < total * 2 && seen.size < total; i++) {
      await page.keyboard.press('Tab');
      const idx = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        const v = el?.getAttribute('data-kbd');
        return v === null || v === undefined ? null : Number(v);
      });
      if (idx === null) continue;
      if (!seen.has(idx)) {
        seen.add(idx);
        if (!(await focusedHasIndicator(page))) {
          const desc = await page.evaluate(() => {
            const el = document.activeElement as HTMLElement;
            return `${el.tagName}${el.id ? '#' + el.id : ''} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}"`;
          });
          noIndicator.push(desc);
        }
      }
    }

    expect(noIndicator, `controls missing a visible focus indicator:\n  ${noIndicator.join('\n  ')}`).toEqual([]);
    expect(seen.size, `only ${seen.size}/${total} controls were reachable by Tab`).toBe(total);
  });
});

test.describe('keyboard: share popover', () => {
  test('opens, Escape closes, focus returns to trigger', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    const post = PATHS.find((p) => /^\/blog\/[^/]+\/?$/.test(p) && !p.startsWith('/blog/tags'));
    test.skip(!post, 'no blog post in sitemap');
    await page.goto(post!, { waitUntil: 'load' });

    const trigger = page.locator('.share-trigger');
    const panel = page.locator('#share-panel');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(panel).toBeVisible();

    // Focus can move into the panel; Escape must dismiss it and restore the trigger.
    await page.keyboard.press('Escape');
    await expect(panel).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});

test.describe('keyboard: mobile nav', () => {
  test('opens, is navigable, and closes by keyboard @ 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'load' });

    const summary = page.locator('header details summary');
    const details = page.locator('header details');
    const firstLink = page.locator('header details[open] nav[aria-label="Mobile"] a').first();

    await summary.focus();
    await expect(summary).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');

    // Menu contents are reachable by Tab.
    await page.keyboard.press('Tab');
    await expect(firstLink).toBeFocused();

    // Closable by keyboard: re-focus the summary and toggle it shut.
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(details).not.toHaveAttribute('open', '');
  });
});

test.describe('keyboard: FAQ accordion', () => {
  test('toggles with Enter and Space', async ({ page }) => {
    // The FAQ accordion lives on the About page.
    await page.goto('/about', { waitUntil: 'load' });
    const summary = page.locator('main details summary').first();
    test.skip((await summary.count()) === 0, 'no FAQ accordion on /about');

    const details = page.locator('main details').first();
    await summary.focus();

    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');
    await page.keyboard.press('Enter');
    await expect(details).not.toHaveAttribute('open', '');

    await page.keyboard.press('Space');
    await expect(details).toHaveAttribute('open', '');
    await page.keyboard.press('Space');
    await expect(details).not.toHaveAttribute('open', '');
  });
});

test.describe('keyboard: contact form', () => {
  test('labels resolve for every field and submit is reachable', async ({ page }) => {
    await page.goto('/contact', { waitUntil: 'load' });

    // getByLabel resolving proves each control has an associated, programmatic label.
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();

    // Submit button is keyboard-focusable.
    const submit = page.getByRole('button', { name: /send message/i });
    await submit.focus();
    await expect(submit).toBeFocused();
  });
});
