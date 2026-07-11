import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** URL-safe slug for a tag display name. "Heat Pumps" -> "heat-pumps". */
export function slugifyTag(tag: string): string {
  return tag
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Tag display name, slug, and post count — sorted by count desc, then name asc. */
export function getAllTags(posts: Post[]): { tag: string; slug: string; count: number }[] {
  const bySlug = new Map<string, { tag: string; slug: string; count: number }>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugifyTag(tag);
      const entry = bySlug.get(slug);
      if (entry) entry.count += 1;
      else bySlug.set(slug, { tag, slug, count: 1 });
    }
  }
  return [...bySlug.values()].sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

/** Posts carrying the given tag slug, order preserved from the input list. */
export function postsForTagSlug(posts: Post[], slug: string): Post[] {
  return posts.filter((p) => p.data.tags.some((t) => slugifyTag(t) === slug));
}

/**
 * Up to n related posts. Ranked by shared-tag count (desc), then date (desc),
 * so posts sharing tags come first and the rest fills with the most recent.
 * Never returns the post itself.
 */
export function getRelatedPosts(post: Post, all: Post[], n = 3): Post[] {
  const own = new Set(post.data.tags.map(slugifyTag));
  const shared = (p: Post) => p.data.tags.filter((t) => own.has(slugifyTag(t))).length;
  return all
    .filter((p) => p.id !== post.id)
    .sort((a, b) => shared(b) - shared(a) || b.data.date.valueOf() - a.data.date.valueOf())
    .slice(0, n);
}

/**
 * Neighbours in a date-desc list: `prev` is the newer post, `next` the older.
 * Boundaries return null.
 */
export function getAdjacentPosts(post: Post, all: Post[]): { prev: Post | null; next: Post | null } {
  const i = all.findIndex((p) => p.id === post.id);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}

/**
 * All published posts, newest-first. Drafts and future-dated (scheduled) posts
 * are hidden in production builds but shown during `astro dev` for previewing.
 */
export async function getPublishedPosts(): Promise<Post[]> {
  const { getCollection } = await import('astro:content');
  const now = Date.now();
  const posts = await getCollection('posts', (p: Post) =>
    import.meta.env.DEV ? true : !p.data.draft && p.data.date.valueOf() <= now
  );
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}
