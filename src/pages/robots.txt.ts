import type { APIRoute } from 'astro';
import { site } from '../config/site';

/**
 * robots.txt generated at build time so the Sitemap URL always tracks the real
 * `site` value from astro.config.mjs — no stale hardcoded domain. Allow-all is
 * the correct default for a public marketing site.
 */
export const GET: APIRoute = ({ site: siteUrl }) => {
  const origin = siteUrl ?? new URL(site.url);
  const sitemapURL = new URL('sitemap-index.xml', origin);
  const body = `User-agent: *\nAllow: /\n\nSitemap: ${sitemapURL.href}\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
