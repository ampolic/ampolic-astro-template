import { site } from '../config/site';
import type { ShareTarget } from '../config/site';

export interface ShareItem {
  key: ShareTarget;
  label: string;
  icon: string;
  /* Present for intent links; absent for the JS-only native/copy actions. */
  href?: string;
  aria: string;
}

/** Resolve site.shareLinks into render-ready items, in configured order. */
export function buildShareItems(title: string, url: string, ogImage: string): ShareItem[] {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const og = encodeURIComponent(ogImage);
  const defs: Record<ShareTarget, { label: string; icon: string; href?: string }> = {
    native: { label: 'Share…', icon: 'lucide:share-2' },
    copy: { label: 'Copy link', icon: 'lucide:link' },
    x: { label: 'X', icon: 'simple-icons:x', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    facebook: { label: 'Facebook', icon: 'simple-icons:facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    linkedin: { label: 'LinkedIn', icon: 'simple-icons:linkedin', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    bluesky: { label: 'Bluesky', icon: 'simple-icons:bluesky', href: `https://bsky.app/intent/compose?text=${t}%20${u}` },
    threads: { label: 'Threads', icon: 'simple-icons:threads', href: `https://www.threads.net/intent/post?text=${t}%20${u}` },
    whatsapp: { label: 'WhatsApp', icon: 'simple-icons:whatsapp', href: `https://wa.me/?text=${t}%20${u}` },
    telegram: { label: 'Telegram', icon: 'simple-icons:telegram', href: `https://t.me/share/url?url=${u}&text=${t}` },
    reddit: { label: 'Reddit', icon: 'simple-icons:reddit', href: `https://www.reddit.com/submit?url=${u}&title=${t}` },
    pinterest: { label: 'Pinterest', icon: 'simple-icons:pinterest', href: `https://pinterest.com/pin/create/button/?url=${u}&media=${og}&description=${t}` },
    email: { label: 'Email', icon: 'lucide:mail', href: `mailto:?subject=${t}&body=${u}` },
    sms: { label: 'Text message', icon: 'lucide:message-square', href: `sms:?body=${t}%20${u}` },
  };
  const ariaFor = (key: ShareTarget, label: string) =>
    key === 'native' ? 'Share via device'
    : key === 'copy' ? 'Copy link to clipboard'
    : key === 'email' ? 'Share via email'
    : key === 'sms' ? 'Share via text message'
    : `Share on ${label}`;
  return site.shareLinks.map((key) => ({ key, ...defs[key], aria: ariaFor(key, defs[key].label) }));
}
