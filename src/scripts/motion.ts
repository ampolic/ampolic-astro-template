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

      // Enter-only fade/rise, ≤0.6s, no pinning, no scrub.
      document.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 24,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });
    },
  );
}
