import type { APIRoute } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { getPublishedPosts, type Post } from '../../lib/posts';
import { site } from '../../config/site';

export async function getStaticPaths() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ params: { slug: post.id }, props: { post } }));
}

/* Read the source fonts from the project root; cwd is the project root during
   `astro dev`/`astro build`, and the files are never emitted into dist.
   Static weights (not the variable TTF) — Satori's font parser needs static. */
const fontDir = join(process.cwd(), 'src/assets/og');
const [regular, semibold, bold] = await Promise.all([
  readFile(join(fontDir, 'Archivo-Regular.ttf')),
  readFile(join(fontDir, 'Archivo-SemiBold.ttf')),
  readFile(join(fontDir, 'Archivo-Bold.ttf')),
]);
const { bg, fg, brand } = site.og;

/** A branded 1200×630 social card. Satori accepts this vnode-object tree directly. */
function card(title: string) {
  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        backgroundColor: bg,
        color: fg,
        fontFamily: 'Archivo',
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '18px' },
            children: [
              { type: 'div', props: { style: { width: '40px', height: '40px', borderRadius: '6px', backgroundColor: brand } } },
              { type: 'div', props: { style: { fontSize: '30px', fontWeight: 600 }, children: site.name } },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', fontSize: '68px', fontWeight: 700, lineHeight: 1.08, maxWidth: '960px' },
            children: title,
          },
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: '16px' },
            children: [
              { type: 'div', props: { style: { width: '64px', height: '6px', borderRadius: '3px', backgroundColor: brand } } },
              { type: 'div', props: { style: { fontSize: '26px', color: brand }, children: site.tagline } },
            ],
          },
        },
      ],
    },
  };
}

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as Post;
  const svg = await satori(card(post.data.title), {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Archivo', data: regular, weight: 400, style: 'normal' },
      { name: 'Archivo', data: semibold, weight: 600, style: 'normal' },
      { name: 'Archivo', data: bold, weight: 700, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), {
    headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
};
