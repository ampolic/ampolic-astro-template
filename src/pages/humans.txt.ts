import type { APIRoute } from 'astro';
import { site } from '../config/site';

/**
 * /humans.txt — a humanstxt.org colophon generated at build time from site.ts, so
 * the business name, optional agency credit, and "last update" date stay current
 * without manual edits.
 */
export const GET: APIRoute = () => {
  const updated = new Date().toISOString().slice(0, 10);
  const lines = [
    '/* TEAM */',
    `Business: ${site.name}`,
    ...(site.credit.enabled ? [`Site by: ${site.credit.name} (${site.credit.url})`] : []),
    '',
    '/* SITE */',
    `Last update: ${updated}`,
    'Built with: Astro, Tailwind CSS',
    'Language: English',
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
