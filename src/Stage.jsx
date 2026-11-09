import { useEffect, useRef } from 'react';
import { M, gsap, reduceMotion, isMobile } from './motion.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
let SHOTS = null, mixPose = null;   // filled in when the 3D code has loaded

// How big the chip looks per unit of "fit", as a share of the shorter screen side.
const SIZE = { whole: [1.26, 0.8], apart: [1.2, 1.36] };

// Put the chip inside a reserved box on the page, so it never sits behind text.
function slotPose(sel, shot, kind, opacity = 1) {
  const el = document.querySelector(sel), sz = M.engine?.size();
  if (!el || !sz || !sz.W) return { ...shot, opacity: 0 };
  const r = el.getBoundingClientRect(), base = Math.min(sz.W, sz.H), [kw, kh] = SIZE[kind];
  if (r.width < 60 || r.height < 60) return { ...shot, opacity: 0 };
  const fit = Math.min(r.width / (kw * base), r.height / (kh * base)) * 0.94;
  return { ...shot, ox: (r.left + r.width / 2) / sz.W - 0.5, oy: (r.top + r.height / 2) / sz.H - 0.5, fit, opacity, track: true };
}

// The camera script: where the chip should be for the current scroll position.
function poseNow() {
  const mobile = isMobile();
  const S = SHOTS[mobile ? 'mobile' : 'desktop'];
  const y = window.scrollY, vh = window.innerHeight;
  const st = M.pinST;
  if (!st) return mobile ? slotPose('.hero-slot', S.hero, 'whole') : S.hero;
  let pose;
  if (reduceMotion) {
    pose = y < st.start ? (mobile ? slotPose('.hero-slot', S.hero, 'whole') : S.hero) : { ...S.park, opacity: 0 };
  } else if (mobile) {
    // phones: the chip lives in a slot at the top of the hero, then hands over (while invisible)
    // to a slot in the pinned section, so text never scrolls underneath it
    if (y <= st.start) {
      const a = clamp(y / Math.max(1, st.start));
      pose = a < 0.42
        ? slotPose('.hero-slot', S.hero, 'whole', 1 - ease(a / 0.42))
        : slotPose('.inside-slot', S.lift, 'apart', ease((a - 0.42) / 0.58));
    } else if (y <= st.end) {
      const p = st.progress;
      let shot;
      if (p < 0.6) { shot = mixPose(S.lift, S.apart, ease(clamp(p / 0.28))); shot.explode = S.lift.explode + (1 - S.lift.explode) * ease(clamp((p - 0.14) / 0.46)); }
      else if (p < 0.78) shot = S.apart;
      else shot = mixPose(S.apart, S.rebuild, ease((p - 0.78) / 0.22));
      pose = slotPose('.inside-slot', shot, 'apart');
    } else {
      pose = slotPose('.inside-slot', S.rebuild, 'apart', 1 - ease(clamp((y - st.end) / (vh * 0.45))));
    }
  } else if (y <= st.start) {
    pose = mixPose(S.hero, S.lift, ease(clamp(y / Math.max(1, st.start))));
  } else if (y <= st.end) {
    // the camera gets into position first, then the layers come off
    const p = st.progress;
    if (p < 0.6) {
      pose = mixPose(S.lift, S.apart, ease(clamp(p / 0.28)));
      pose.explode = S.lift.explode + (1 - S.lift.explode) * ease(clamp((p - 0.14) / 0.46));
    } else if (p < 0.78) pose = S.apart;
    else pose = mixPose(S.apart, S.rebuild, ease((p - 0.78) / 0.22));
  } else {
    pose = mixPose(S.rebuild, S.park, ease(clamp((y - st.end) / (vh * 0.8))));
  }
  // at the end the chip lands in its own space beside the contact details
  const contact = document.getElementById('contact');
  if (contact && y > st.end) {
    const c = clamp((vh - contact.getBoundingClientRect().top) / (vh * 0.85));
    if (c > 0) {
      const slot = slotPose('.chip-slot', S.outro, 'whole');
      pose = reduceMotion ? (c > 0.5 ? slot : pose) : { ...mixPose(pose, slot, ease(c)), track: c > 0.6 };
    }
  }
  return pose;
}

export default function Stage() {
  const ref = useRef(null);
  useEffect(() => {
    let engine = null, alive = true;
    const tick = (time, deltaMS) => {
      if (!engine || document.hidden) return;
      engine.update(poseNow(), Math.min(deltaMS / 1000, 0.05));
    };
    const onResize = () => engine?.resize();
    const onMove = (e) => {
      if (e.pointerType === 'touch' || reduceMotion) return;
      engine?.setPointer(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1);
    };
    (async () => {
      // the 3D code loads after the page text, so the words are readable straight away
      const [mod] = await Promise.all([import('./chip/engine.js'), document.fonts.load("800 40px 'Encode Sans'").catch(() => {})]);
      if (!alive) return;
      SHOTS = mod.SHOTS; mixPose = mod.mixPose;
      const lite = window.matchMedia('(hover: none), (max-width: 899px)').matches;
      engine = mod.createEngine(ref.current, { reduce: reduceMotion, lite, onFrame: (f) => M.onFrame?.(f) });
      if (!engine) { document.documentElement.classList.add('no-webgl'); return; }
      M.engine = engine;
      engine.setTheme(M.theme);
      document.documentElement.classList.add('webgl');
      engine.settle(1.6);
      gsap.ticker.add(tick);
    })();
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      alive = false;
      gsap.ticker.remove(tick);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      engine?.dispose(); M.engine = null;
    };
  }, []);
  return <canvas ref={ref} className="stage" aria-hidden="true" />;
}
