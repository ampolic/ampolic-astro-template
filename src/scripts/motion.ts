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

      // Mechanical settle: crisp deceleration, no bounce/overshoot.
      const ease = 'power3.out';

      // Hero page-load sequence: eyebrow → headline → subhead → CTA, 80ms apart.
      const heroEls = gsap.utils.toArray<HTMLElement>('[data-hero]');
      if (heroEls.length) {
        gsap.from(heroEls, { opacity: 0, y: 12, duration: 0.45, ease, stagger: 0.08 });
      }

      // Spec-strip metrics tick in one after another — readouts powering on.
      const specEls = gsap.utils.toArray<HTMLElement>('[data-spec]');
      if (specEls.length) {
        gsap.from(specEls, {
          opacity: 0,
          y: 12,
          duration: 0.45,
          ease,
          stagger: 0.09,
          scrollTrigger: { trigger: specEls[0], start: 'top 90%', once: true },
        });
      }

      // Grids: stagger children 60ms on enter.
      document.querySelectorAll<HTMLElement>('[data-stagger]').forEach((grid) => {
        gsap.from(Array.from(grid.children), {
          opacity: 0,
          y: 12,
          duration: 0.45,
          ease,
          stagger: 0.06,
          scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
        });
      });

      // Enter-only fade/rise for any remaining sections.
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 12,
          duration: 0.45,
          ease,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
    },
  );
}
