import { describe, it, expect } from 'vitest';
import { buildShareItems } from '../src/lib/share';
import { site } from '../src/config/site';

const title = 'A & B: "Quotes"';
const url = 'https://example.com/blog/post/';
const og = 'https://example.com/og/post.png';

describe('buildShareItems', () => {
  const items = buildShareItems(title, url, og);

  it('renders exactly the configured targets, in order', () => {
    expect(items.map((i) => i.key)).toEqual(site.shareLinks);
  });

  it('URL-encodes title and url in every intent link', () => {
    const t = encodeURIComponent(title);
    const u = encodeURIComponent(url);
    for (const item of items.filter((i) => i.href)) {
      expect(item.href).not.toContain(' ');
      expect(item.href!.includes(t) || item.href!.includes(u)).toBe(true);
    }
  });

  it('gives native and copy no href (JS-only actions)', () => {
    for (const key of ['native', 'copy'] as const) {
      const item = buildShareItems(title, url, og).find((i) => i.key === key);
      // only assert when the target is configured
      if (item) expect(item.href).toBeUndefined();
    }
  });

  it('uses the OG image only for pinterest', () => {
    const all = buildShareItems(title, url, og);
    const p = all.find((i) => i.key === 'pinterest');
    if (p) expect(p.href).toContain(encodeURIComponent(og));
    for (const item of all.filter((i) => i.key !== 'pinterest' && i.href)) {
      expect(item.href).not.toContain(encodeURIComponent(og));
    }
  });

  it('sets a descriptive aria label on every item', () => {
    for (const item of items) expect(item.aria.length).toBeGreaterThan(0);
  });
});
