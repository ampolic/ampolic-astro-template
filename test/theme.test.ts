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
