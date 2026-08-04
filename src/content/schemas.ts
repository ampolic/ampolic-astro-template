import { z } from 'astro/zod';

export const serviceSchema = z.object({
  title: z.string(),
  summary: z.string(),
  /* Meta description for the service detail page (~150 chars, unique per service).
     Falls back to `summary` when omitted; set it when summary reads awkwardly as SEO copy. */
  description: z.string().optional(),
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

/* Free-form markdown pages (about, team, landing pages…), the shape WordPress
   page exports convert to. Rendered by src/pages/[...page].astro at /<slug>. */
export const pageSchema = z.object({
  title: z.string(),
  description: z.string(),
  date: z.coerce.date().optional(),
  updated: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  noindex: z.boolean().default(false),
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
