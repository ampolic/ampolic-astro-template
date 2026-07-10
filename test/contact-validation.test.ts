import { describe, it, expect } from 'vitest';
import { validateSubmission } from '../src/lib/contact-validation';

const base = { name: 'Sam', email: 'sam@example.com', message: 'Hello there', website: '', startedAt: 0 };

describe('validateSubmission', () => {
  it('accepts a well-formed, unhurried submission', () => {
    expect(validateSubmission(base, 5000)).toEqual({ ok: true });
  });
  it('rejects a filled honeypot', () => {
    expect(validateSubmission({ ...base, website: 'spam' }, 5000).ok).toBe(false);
  });
  it('rejects an implausibly fast submission', () => {
    expect(validateSubmission(base, 1000).ok).toBe(false);
  });
  it('rejects a missing message', () => {
    expect(validateSubmission({ ...base, message: '' }, 5000).ok).toBe(false);
  });
});
