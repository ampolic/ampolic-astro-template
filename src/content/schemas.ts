import { z } from 'astro/zod';

export const serviceSchema = z.object({
  title: z.string(),
  summary: z.string(),
  icon: z.string(),
  order: z.number(),
  featured: z.boolean().default(false),
  /* Optional supporting photo (added in content.config via image()) + its alt text. */
  imageAlt: z.string().optional(),
});

export const postSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date(),
  /* Optional last-updated date; drives "Updated …" and JSON-LD dateModified. */
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

export const testimonialSchema = z.object({
  author: z.string(),
  role: z.string(),
  quote: z.string(),
  rating: z.number().min(1).max(5).optional(),
});

export const faqSchema = z.object({
  question: z.string(),
  order: z.number(),
});
