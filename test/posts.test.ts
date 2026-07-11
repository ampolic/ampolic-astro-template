import { describe, it, expect } from 'vitest';
import {
  slugifyTag,
  getAllTags,
  postsForTagSlug,
  getRelatedPosts,
  getAdjacentPosts,
  type Post,
} from '../src/lib/posts';

function makePost(id: string, date: string, tags: string[] = []): Post {
  return {
    id,
    collection: 'posts',
    data: { title: id, description: '', date: new Date(date), tags, draft: false },
    body: '',
  } as unknown as Post;
}

describe('slugifyTag', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugifyTag('Heat Pumps')).toBe('heat-pumps');
  });
  it('lowercases a single word', () => {
    expect(slugifyTag('HVAC')).toBe('hvac');
  });
  it('collapses whitespace and trims', () => {
    expect(slugifyTag('  Air   Quality  ')).toBe('air-quality');
  });
  it('strips punctuation without leaving stray hyphens', () => {
    expect(slugifyTag('C++ Tips')).toBe('c-tips');
  });
});

describe('getAllTags', () => {
  it('counts tags across posts and sorts by count desc then name', () => {
    const posts = [
      makePost('a', '2026-01-01', ['Heating', 'Air Quality']),
      makePost('b', '2026-01-02', ['Heating']),
      makePost('c', '2026-01-03', ['Cooling']),
    ];
    const tags = getAllTags(posts);
    expect(tags).toEqual([
      { tag: 'Heating', slug: 'heating', count: 2 },
      { tag: 'Air Quality', slug: 'air-quality', count: 1 },
      { tag: 'Cooling', slug: 'cooling', count: 1 },
    ]);
  });
});

describe('postsForTagSlug', () => {
  it('returns only posts carrying the tag, matched by slug', () => {
    const posts = [
      makePost('a', '2026-01-01', ['Heat Pumps']),
      makePost('b', '2026-01-02', ['Cooling']),
      makePost('c', '2026-01-03', ['Heat Pumps', 'Cooling']),
    ];
    const result = postsForTagSlug(posts, 'heat-pumps').map((p) => p.id);
    expect(result).toEqual(['a', 'c']);
  });
});

describe('getRelatedPosts', () => {
  const posts = [
    makePost('self', '2026-01-05', ['Heating', 'Air Quality']),
    makePost('most-shared', '2026-01-01', ['Heating', 'Air Quality']),
    makePost('one-shared', '2026-01-02', ['Heating']),
    makePost('unrelated-recent', '2026-01-04', ['Plumbing']),
    makePost('unrelated-old', '2026-01-03', ['Plumbing']),
  ];
  const self = posts[0];

  it('never includes the post itself', () => {
    const related = getRelatedPosts(self, posts, 4);
    expect(related.map((p) => p.id)).not.toContain('self');
  });

  it('ranks by shared-tag count then fills with most-recent', () => {
    const related = getRelatedPosts(self, posts, 3).map((p) => p.id);
    expect(related).toEqual(['most-shared', 'one-shared', 'unrelated-recent']);
  });

  it('respects the requested count', () => {
    expect(getRelatedPosts(self, posts, 1)).toHaveLength(1);
  });
});

describe('getAdjacentPosts', () => {
  const posts = [
    makePost('newest', '2026-01-03'),
    makePost('middle', '2026-01-02'),
    makePost('oldest', '2026-01-01'),
  ];

  it('returns newer as prev and older as next for a middle post', () => {
    const { prev, next } = getAdjacentPosts(posts[1], posts);
    expect(prev?.id).toBe('newest');
    expect(next?.id).toBe('oldest');
  });

  it('has no prev for the newest post', () => {
    expect(getAdjacentPosts(posts[0], posts).prev).toBeNull();
  });

  it('has no next for the oldest post', () => {
    expect(getAdjacentPosts(posts[2], posts).next).toBeNull();
  });
});
