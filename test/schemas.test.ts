import { describe, it, expect } from 'vitest';
import { serviceSchema, postSchema, testimonialSchema, faqSchema } from '../src/content/schemas';

describe('service schema', () => {
  it('defaults featured to false', () => {
    const parsed = serviceSchema.parse({ title: 'AC Repair', summary: 'Fast fixes', icon: 'lucide:wind', order: 1 });
    expect(parsed.featured).toBe(false);
  });
  it('rejects a missing title', () => {
    expect(() => serviceSchema.parse({ summary: 'x', icon: 'i', order: 1 })).toThrow();
  });
});

describe('post schema', () => {
  it('coerces an ISO date string to a Date and defaults arrays', () => {
    const parsed = postSchema.parse({ title: 'T', description: 'D', date: '2026-01-05' });
    expect(parsed.date).toBeInstanceOf(Date);
    expect(parsed.tags).toEqual([]);
    expect(parsed.draft).toBe(false);
  });
});

describe('testimonial schema', () => {
  it('rejects a rating above 5', () => {
    expect(() => testimonialSchema.parse({ author: 'A', role: 'R', quote: 'Q', rating: 6 })).toThrow();
  });
});

describe('faq schema', () => {
  it('requires question and order', () => {
    expect(() => faqSchema.parse({ question: 'Q?' })).toThrow();
  });
});
