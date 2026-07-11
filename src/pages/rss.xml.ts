import rss from '@astrojs/rss';
import { site } from '../config/site';
import { getPublishedPosts } from '../lib/posts';

export async function GET(context: { site: URL }) {
  const posts = await getPublishedPosts();
  return rss({
    title: site.name,
    description: site.description,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id}`,
    })),
  });
}
