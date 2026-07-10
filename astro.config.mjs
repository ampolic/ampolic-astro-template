import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// TODO before launch: replace with the real production URL.
export default defineConfig({
  site: 'https://example.com',
  output: 'static',
  prefetch: true,
  integrations: [mdx(), sitemap(), icon()],
  vite: { plugins: [tailwindcss()] },
});
