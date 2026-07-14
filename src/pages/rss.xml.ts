import rss from '@astrojs/rss';
import { experimental_AstroContainer } from 'astro/container';
import mdxRenderer from '@astrojs/mdx/server.js';
import { getImage } from 'astro:assets';
import { render } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import { site } from '../config/site';
import { getPublishedPosts } from '../lib/posts';

/** Most recent N posts carried in the feed. */
const FEED_LIMIT = 20;

/** Resolve a (possibly relative) URL against an absolute base; feed readers
 *  cannot be trusted to resolve relative links or image srcs themselves. */
function absolutize(value: string | undefined, base: string): string | undefined {
  if (!value) return value;
  try {
    return new URL(value, base).href;
  } catch {
    return value;
  }
}

/**
 * Sanitize rendered post HTML into feed-safe content:encoded markup:
 * strips scripts/styles/interactive bits, drops unknown tags (icons, custom
 * elements) while keeping their text, and rewrites links/images to absolute.
 * `base` is the item's canonical URL so relative links resolve correctly.
 */
function toFeedHtml(html: string, base: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
      'strong', 'em', 'b', 'i', 'u', 's', 'br', 'hr',
      'img', 'figure', 'figcaption', 'aside',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'sup', 'sub',
    ],
    allowedAttributes: {
      a: ['href', 'title'],
      img: ['src', 'alt', 'title', 'width', 'height'],
    },
    // Drop these tags AND their contents (scripts, styles, interactive widgets).
    nonTextTags: ['script', 'style', 'textarea', 'noscript', 'template', 'button'],
    transformTags: {
      a: (tagName, attribs) => {
        if (attribs.href) attribs.href = absolutize(attribs.href, base) ?? attribs.href;
        return { tagName, attribs };
      },
      img: (tagName, attribs) => {
        if (attribs.src) attribs.src = absolutize(attribs.src, base) ?? attribs.src;
        return { tagName, attribs };
      },
    },
  });
}

/** RSS spec author format is `email (Name)`. */
const feedAuthor = `${site.email} (${site.name})`;

export async function GET(context: { site: URL }) {
  const feedSite = context.site;
  const feedUrl = new URL('rss.xml', feedSite).href;

  // Same visibility rules as the blog index: no drafts, no future-dated posts.
  const now = Date.now();
  const posts = (await getPublishedPosts())
    .filter((p) => !p.data.draft && p.data.date.valueOf() <= now)
    .slice(0, FEED_LIMIT);

  // One container renders every post's MDX (components and all) to HTML.
  const container = await experimental_AstroContainer.create();
  container.addServerRenderer({ renderer: mdxRenderer });

  const items = await Promise.all(
    posts.map(async (post) => {
      const link = new URL(`blog/${post.id}`, feedSite).href;
      const { Content } = await render(post);
      const content = toFeedHtml(await container.renderToString(Content), link);

      // Featured image as media:content (absolute URL + mime); byte length is
      // not cheap to obtain from astro:assets, so media:content is used per spec.
      let media = '';
      if (post.data.cover) {
        const img = await getImage({ src: post.data.cover, width: 1200, format: 'webp' });
        const imgUrl = new URL(img.src, feedSite).href;
        media = `<media:content url="${imgUrl}" medium="image" type="image/webp" />`;
      }

      // RSS 2.0 has no per-item "updated"; carry it as atom:updated (ISO 8601).
      let updated = '';
      if (post.data.updated && post.data.updated.getTime() > post.data.date.getTime()) {
        updated = `<atom:updated>${post.data.updated.toISOString()}</atom:updated>`;
      }

      return {
        title: post.data.title,
        link,
        pubDate: post.data.date,
        description: post.data.description,
        content,
        categories: post.data.tags,
        author: feedAuthor,
        customData: media + updated,
      };
    })
  );

  return rss({
    title: `${site.name} · Blog`,
    description: site.description,
    site: feedSite,
    trailingSlash: false,
    stylesheet: '/rss.xsl',
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
      media: 'http://search.yahoo.com/mrss/',
      content: 'http://purl.org/rss/1.0/modules/content/',
    },
    customData: [
      `<language>en-us</language>`,
      `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    ].join(''),
    items,
  });
}
