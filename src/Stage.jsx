import { useEffect, useRef } from 'react';
import { createEngine, SHOTS, mixPose } from './chip/engine.js';
import { M, gsap, reduceMotion, isMobile } from './motion.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);

// The camera script: where the chip should be for the current scroll position.
function poseNow() {
  const S = SHOTS[isMobile() ? 'mobile' : 'desktop'];
  const y = window.scrollY, vh = window.innerHeight;
  const st = M.pinST;
  if (!st) return S.hero;
  let pose;
  if (reduceMotion) {
    // no blending: a still frame per section
    // reduced motion: the chip stays whole and simply steps aside after the hero
    pose = y < st.start ? S.hero : S.park;
  } else if (y <= st.start) {
    pose = mixPose(S.hero, S.lift, ease(clamp(y / Math.max(1, st.start))));
  } else if (y <= st.end) {
    // the camera gets into position first, then the layers come off
    const p = st.progress;
    if (p < 0.6) {
      pose = { ...mixPose(S.lift, S.apart, ease(clamp(p / 0.28))) };
      pose.explode = S.lift.explode + (1 - S.lift.explode) * ease(clamp((p - 0.14) / 0.46));
    } else if (p < 0.78) pose = S.apart;
    else pose = mixPose(S.apart, S.rebuild, ease((p - 0.78) / 0.22));
  } else {
    pose = mixPose(S.rebuild, S.park, ease(clamp((y - st.end) / (vh * 0.8))));
  }
  const contact = document.getElementById('contact');
  if (contact && y > st.end) {
    const c = clamp((vh - contact.getBoundingClientRect().top) / (vh * 0.85));
    if (c > 0) {
      const slot = slotPose(S.outro);
      pose = reduceMotion ? (c > 0.5 ? slot : pose) : mixPose(pose, slot, ease(c));
      pose.track = c > 0.6;
    }
  }
  return pose;
}

// At the end the chip lands in its own space beside the contact details, never behind text.
function slotPose(outro) {
  const el = document.querySelector('.chip-slot');
  if (!el) return { ...outro, opacity: 0 };
  const r = el.getBoundingClientRect(), W = window.innerWidth, H = window.innerHeight, base = Math.min(W, H);
  if (r.width < 60 || r.height < 60) return { ...outro, opacity: 0 };
  const fit = Math.min(r.width / (1.26 * base), r.height / (0.84 * base)) * 0.9;
  return { ...outro, ox: (r.left + r.width / 2) / W - 0.5, oy: (r.top + r.height / 2) / H - 0.5, fit, opacity: 1 };
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
      try { await document.fonts.load("800 40px 'Encode Sans'"); } catch (e) { /* draw with fallback */ }
      if (!alive) return;
      engine = createEngine(ref.current, { reduce: reduceMotion, onFrame: (f) => M.onFrame?.(f) });
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
