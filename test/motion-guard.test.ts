import { describe, it, expect } from 'vitest';
import { shouldAnimate } from '../src/scripts/prefersReducedMotion';

describe('shouldAnimate', () => {
  it('returns false when the user prefers reduced motion', () => {
    expect(shouldAnimate({ matches: true } as any)).toBe(false);
  });
  it('returns true otherwise', () => {
    expect(shouldAnimate({ matches: false } as any)).toBe(true);
  });
});
