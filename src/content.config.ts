import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import {
  serviceSchema,
  postSchema,
  pageSchema,
  testimonialSchema,
  faqSchema,
} from "./content/schemas";

const services = defineCollection({
  loader: glob({
    base: "./src/content/services",
    pattern: "**/[^_]*.{md,mdx}",
  }),
  schema: ({ image }) =>
    serviceSchema.extend({
      image: z
        .union([image(), z.string().startsWith("/src/assets/images/")])
        .optional(),
    }),
});
const posts = defineCollection({
  loader: glob({ base: "./src/content/posts", pattern: "**/[^_]*.{md,mdx}" }),
  schema: ({ image }) =>
    postSchema.extend({
      cover: z
        .union([image(), z.string().startsWith("/src/assets/images/")])
        .optional(),
    }),
});
/* Free-form markdown pages — the landing spot for WordPress page exports.
   Each file becomes a route at /<slug> via src/pages/[...page].astro; static
   .astro routes always win over this dynamic route on slug collision. */
const pages = defineCollection({
  loader: glob({ base: "./src/content/pages", pattern: "**/[^_]*.{md,mdx}" }),
  schema: pageSchema,
});
const testimonials = defineCollection({
  loader: glob({
    base: "./src/content/testimonials",
    pattern: "**/[^_]*.{md,mdx}",
  }),
  schema: testimonialSchema,
});
const faq = defineCollection({
  loader: glob({ base: "./src/content/faq", pattern: "**/[^_]*.{md,mdx}" }),
  schema: faqSchema,
});

export const collections = { services, posts, pages, testimonials, faq };
