// Shared motion state: one clock (GSAP's ticker) drives Lenis, ScrollTrigger and the 3D stage.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, SplitText);
// phones resize the viewport while the toolbar slides; re-measuring then makes pinned sections jump
ScrollTrigger.config({ ignoreMobileResize: true });

export const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 899px)').matches;

export const M = {
  lenis: null,
  pinST: null,        // ScrollTrigger of the pinned "What's inside" section
  onFrame: null,      // set by the section that draws callouts
  engine: null,
  theme: 'dark',
};

export function startScroll() {
  // phones keep their own native scrolling: it is smoother there than anything done in JavaScript
  if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
  M.lenis = lenis;
  lenis.on('scroll', ScrollTrigger.update);
  const raf = (time) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);
  return () => { gsap.ticker.remove(raf); lenis.destroy(); M.lenis = null; };
}

export function scrollToHash(hash) {
  const el = hash === '#top' ? document.body : document.querySelector(hash);
  if (!el) return;
  if (M.lenis) M.lenis.scrollTo(hash === '#top' ? 0 : el, { offset: hash === '#top' ? 0 : -8, duration: 1.2 });
  else el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}

export { gsap, ScrollTrigger };
