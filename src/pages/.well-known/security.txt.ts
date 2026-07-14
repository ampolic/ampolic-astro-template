import type { APIRoute } from 'astro';
import { site } from '../../config/site';

/**
 * RFC 9116 security.txt, generated at build time so `Expires` is always ~1 year
 * from the build date and never silently goes stale. Contact is the legal
 * contact address from site.ts.
 */
export const GET: APIRoute = () => {
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const body =
    [
      `Contact: mailto:${site.legal.contactEmail}`,
      `Expires: ${expires}`,
      `Preferred-Languages: en`,
    ].join('\n') + '\n';
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
