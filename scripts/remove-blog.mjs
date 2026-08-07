#!/usr/bin/env node
/* Strip the blog from a site generated from ampolic-astro-template.
   Most client sites don't need one — run this once right after generation:
     node scripts/remove-blog.mjs
   Content collections + Decap stay: only the `posts` collection and the
   blog/RSS/OG-per-post surface are removed. Re-adding a blog later = copy
   the deleted file set back from the template.
   Idempotent: safe to re-run. */
import { rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const gone = [];
const rm = (rel) => {
  const p = resolve(root, rel);
  if (existsSync(p)) {
    rmSync(p, { recursive: true });
    gone.push(rel);
  }
};

/* Files/dirs that exist only for the blog. */
[
  'src/pages/blog',
  'src/pages/rss.xml.ts',
  'src/pages/og',
  'public/rss.xsl',
  'src/components/PostRow.astro',
  'src/components/PostNav.astro',
  'src/components/PostToc.astro',
  'src/components/RelatedPosts.astro',
  'src/components/TagList.astro',
  'src/components/ShareMenu.astro',
  'src/lib/posts.ts',
  'src/lib/readingTime.ts',
  'src/lib/share.ts',
  'src/content/posts',
  'test/share.test.ts',
  'test/readingTime.test.ts',
  'test/posts.test.ts',
  'test/rss.test.ts',
].forEach(rm);

/* Surgical edits in shared files. */
const edit = (rel, fn) => {
  const p = resolve(root, rel);
  if (!existsSync(p)) return;
  const before = readFileSync(p, 'utf8');
  const after = fn(before);
  if (after !== before) {
    writeFileSync(p, after);
    gone.push(`${rel} (edited)`);
  }
};

// RSS discovery link in the layout head.
edit('src/layouts/Base.astro', (s) =>
  s.replace(/^\s*<link rel="alternate" type="application\/rss\+xml"[^\n]*\n/m, '')
);

// posts collection: schema, collection definition, export, Decap section.
edit('src/content/schemas.ts', (s) =>
  s.replace(/export const postSchema = z\.object\(\{[\s\S]*?\}\);\n\n/, '')
);
edit('src/content.config.ts', (s) =>
  s
    .replace(/const posts = defineCollection\(\{[\s\S]*?\}\);\n/, '')
    .replace(/\n\s*postSchema,/, '')
    .replace(/posts,\s*/, '')
);
edit('public/admin/config.yml', (s) =>
  s.replace(/  - name: posts\n(?:.*\n)*?(?=  - name: )/, '')
);

// llms.txt: drop the posts import and the "Recent posts" section.
edit('src/pages/llms.txt.ts', (s) =>
  s
    .replace(/^import \{ getPublishedPosts \} from '\.\.\/lib\/posts';\n/m, '')
    .replace(/^\s*const posts = \(await getPublishedPosts\(\)\)[^\n]*\n/m, '')
    .replace(/\s*'## Recent posts',\n\s*\.\.\.posts\.map\([^\n]*\n\s*'',\n/, '\n    \'\',\n')
);

// schemas unit test: drop the postSchema import + its describe block.
edit('test/schemas.test.ts', (s) =>
  s
    .replace(/,?\s*postSchema/, '')
    .replace(/describe\('post schema'[\s\S]*?\n\}\);\n\n/, '')
);

// 301 the removed routes.
edit('public/_redirects', (s) =>
  s.includes('/blog') ? s : s + '\n# Blog removed (remove-blog.mjs)\n/blog / 301\n/blog/* / 301\n/rss.xml / 301\n'
);

console.log(gone.length ? `Removed:\n  ${gone.join('\n  ')}` : 'Nothing to remove (already blog-free).');
console.log('\nNow verify: pnpm check && pnpm build && pnpm test');
