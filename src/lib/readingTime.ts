/* Estimate word count and reading time from a post's raw markdown body.
   Strips code, images, links, and markdown syntax so only prose words are counted. */
export function readingTime(markdown: string, wordsPerMinute = 200): { words: number; minutes: number } {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ') // fenced code blocks
    .replace(/`[^`]*`/g, ' ') // inline code
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // images
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // links → link text
    .replace(/[#>*_~`|-]/g, ' ') // markdown punctuation
    .replace(/\s+/g, ' ')
    .trim();
  const words = text ? text.split(' ').length : 0;
  const minutes = Math.max(1, Math.round(words / wordsPerMinute));
  return { words, minutes };
}
