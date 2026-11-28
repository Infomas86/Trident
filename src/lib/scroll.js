import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Smooth scroll (Lenis) disinkronkan dengan ScrollTrigger lewat satu ticker GSAP.
// Panel yang punya scroll sendiri (modal) ditandai data-lenis-prevent supaya tetap bisa digulir.
export function initSmoothScroll() {
  if (prefersReducedMotion()) return () => {};
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (t) => lenis.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  return () => {
    gsap.ticker.remove(tick);
    lenis.destroy();
  };
}
