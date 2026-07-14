import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getPublishedPosts } from '../lib/posts';
import { site } from '../config/site';

/**
 * /llms.txt — a plain-text map of the site for AI crawlers and answer engines.
 * Follows the llmstxt.org convention: an H1 name, a one-line summary blockquote,
 * then linked sections. Summaries come straight from config + content frontmatter
 * so this stays accurate with zero extra maintenance.
 */
export const GET: APIRoute = async ({ site: siteUrl }) => {
  const base = siteUrl ?? new URL(site.url);
  const abs = (path: string) => new URL(path, base).href;

  const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order);
  const posts = (await getPublishedPosts()).slice(0, 5);

  const owner = site.credentials.owner;
  const years = new Date().getFullYear() - site.trust.established;

  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${site.name} — ${site.primaryService} in ${site.city}, ${site.address.region}. `
      + `Established ${site.trust.established} (${years} years). Serving ${site.serviceAreas.join(', ')}. `
      + `Phone ${site.phone}. Hours: ${site.hours.map((h) => `${h.days} ${h.opens}–${h.closes}`).join('; ')}.`,
    '',
    '## Key pages',
    `- [Services](${abs('/services')}): ${site.description}`,
    `- [About](${abs('/about')}): ${owner.name}, ${owner.title} — a family-owned HVAC company serving ${site.city} since ${site.trust.established}.`,
    `- [Contact](${abs('/contact')}): Request a quote or book a service call in ${site.serviceArea}.`,
    '',
    '## Services',
    ...services.map((s) => `- [${s.data.title}](${abs(`/services/${s.id}`)}): ${s.data.summary}`),
    '',
    '## Recent posts',
    ...posts.map((p) => `- [${p.data.title}](${abs(`/blog/${p.id}`)}): ${p.data.description}`),
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
