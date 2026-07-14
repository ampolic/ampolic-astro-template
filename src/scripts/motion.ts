import { shouldAnimate } from './prefersReducedMotion';

export function initMotion(): void {
  const mq = matchMedia('(prefers-reduced-motion: reduce)');
  if (!shouldAnimate(mq)) return; // Lenis AND GSAP fully disabled — native scroll, no reveals.

  Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('lenis')]).then(
    ([{ gsap }, { ScrollTrigger }, { default: Lenis }]) => {
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 0.9 });
      const raf = (time: number) => {
        lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);
      // Keep ScrollTrigger in lockstep with Lenis' smoothed scroll position.
      lenis.on('scroll', ScrollTrigger.update);

      // Smooth-scroll in-page anchor links (e.g. the post TOC) through Lenis.
      // Lenis honors the target's scroll-margin-top, so the heading's scroll-mt
      // (set in Prose) clears the sticky header — no extra offset needed. No-JS
      // falls back to native anchors + the same scroll-margin-top.
      document.querySelectorAll<HTMLAnchorElement>('a[data-toc-link]').forEach((link) => {
        link.addEventListener('click', (e) => {
          const id = link.dataset.tocLink;
          const target = id ? document.getElementById(id) : null;
          if (!target) return;
          e.preventDefault();
          lenis.scrollTo(target);
          history.pushState(null, '', `#${id}`);
        });
      });

      // Elements that morph via a cross-document View Transition (their
      // view-transition-name is set in the markup) must never also get a GSAP
      // entrance reveal — that would animate them twice. They carry no reveal
      // marker today, so this filter is a guard that keeps that guarantee true
      // if a reveal wrapper is ever added around them.
      const notMorph = (el: HTMLElement) => !el.hasAttribute('data-vt-morph');

      // Mechanical settle: crisp deceleration, no bounce/overshoot.
      const ease = 'power3.out';
      const from = { opacity: 0, y: 12 };
      // fromTo (not from): an explicit end state can never be mis-captured as opacity:0 by a
      // ScrollTrigger.refresh() that fires between tween creation and activation — which is exactly
      // what a lazy image decoding inside a reveal target used to do, leaving cards stuck invisible.
      const to = { opacity: 1, y: 0, duration: 0.45, ease };

      // Hero page-load sequence: eyebrow → headline → subhead → CTA, 80ms apart.
      const heroEls = gsap.utils.toArray<HTMLElement>('[data-hero]').filter(notMorph);
      if (heroEls.length) {
        gsap.fromTo(heroEls, from, { ...to, stagger: 0.08 });
      }

      // Spec-strip metrics tick in one after another — readouts powering on.
      const specEls = gsap.utils.toArray<HTMLElement>('[data-spec]').filter(notMorph);
      if (specEls.length) {
        gsap.fromTo(specEls, from, {
          ...to,
          stagger: 0.09,
          scrollTrigger: { trigger: specEls[0], start: 'top 90%', once: true },
        });
      }

      // Grids: stagger children 60ms on enter.
      document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((grid) => {
        gsap.fromTo((Array.from(grid.children) as HTMLElement[]).filter(notMorph), from, {
          ...to,
          stagger: 0.06,
          scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
        });
      });

      // Enter-only fade/rise for any remaining sections.
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (!notMorph(el)) return;
        gsap.fromTo(el, from, {
          ...to,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
    },
  );
}
