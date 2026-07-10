import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { serviceSchema, postSchema, testimonialSchema, faqSchema } from './content/schemas';

const services = defineCollection({
  loader: glob({ base: './src/content/services', pattern: '**/[^_]*.{md,mdx}' }),
  schema: serviceSchema,
});
const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '**/[^_]*.{md,mdx}' }),
  schema: ({ image }) => postSchema.extend({ cover: image().optional() }),
});
const testimonials = defineCollection({
  loader: glob({ base: './src/content/testimonials', pattern: '**/[^_]*.{md,mdx}' }),
  schema: testimonialSchema,
});
const faq = defineCollection({
  loader: glob({ base: './src/content/faq', pattern: '**/[^_]*.{md,mdx}' }),
  schema: faqSchema,
});

export const collections = { services, posts, testimonials, faq };
