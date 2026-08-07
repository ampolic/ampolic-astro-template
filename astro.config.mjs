import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import icon from "astro-icon";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://ampolic-astro-template.pages.dev",
  output: "static",
  // Canonical URLs carry no trailing slash. Matches Cloudflare Pages' default,
  // which serves `about/index.html` at `/about` and drops any trailing slash.
  // build.format stays 'directory' (the default) so the output tree is unchanged;
  // canonical/sitemap consistency is enforced in code (SEO.astro normalises, and
  // internal links are authored without trailing slashes).
  trailingSlash: "never",
  prefetch: true,
  integrations: [mdx(), sitemap(), icon()],
  vite: { plugins: [tailwindcss()] },
});
