import { useEffect, useRef } from 'react';
import { M, gsap, reduceMotion, isMobile } from './motion.js';

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t) => t * t * (3 - 2 * t);
let SHOTS = null, mixPose = null;   // filled in when the 3D code has loaded

// How big the chip looks per unit of "fit", as a share of the shorter side of the canvas.
const SIZE = { whole: [1.26, 0.8], apart: [1.2, 1.36] };
const fitIn = (w, h, kind) => { const base = Math.min(w, h), [kw, kh] = SIZE[kind]; return Math.min(w / (kw * base), h / (kh * base)) * 0.92; };

// The pinned section's camera script: camera first, then the layers come off, then back together.
function insideShot(S, p) {
  if (p < 0.6) {
    const s = mixPose(S.lift, S.apart, ease(clamp(p / 0.28)));
    s.explode = S.lift.explode + (1 - S.lift.explode) * ease(clamp((p - 0.14) / 0.46));
    return s;
  }
  if (p < 0.78) return { ...S.apart };
  return mixPose(S.apart, S.rebuild, ease((p - 0.78) / 0.22));
}

// Desktop: one fixed canvas behind the page; the scroll position picks the shot.
function desktopPose() {
  const S = SHOTS.desktop, y = window.scrollY, vh = window.innerHeight, st = M.pinST;
  if (!st) return S.hero;
  let pose;
  if (reduceMotion) pose = y < st.start ? S.hero : { ...S.park, opacity: 0 };
  else if (y <= st.start) pose = mixPose(S.hero, S.lift, ease(clamp(y / Math.max(1, st.start))));
  else if (y <= st.end) pose = insideShot(S, st.progress);
  else pose = mixPose(S.rebuild, S.park, ease(clamp((y - st.end) / (vh * 0.8))));
  // at the end the chip lands in its own space beside the contact details
  const contact = document.getElementById('contact'), slot = document.querySelector('.chip-slot'), sz = M.engine.size();
  if (contact && slot && y > st.end) {
    const c = clamp((vh - contact.getBoundingClientRect().top) / (vh * 0.85));
    if (c > 0) {
      const r = slot.getBoundingClientRect();
      const base = Math.min(sz.W, sz.H), [kw, kh] = SIZE.whole;
      const land = { ...S.outro, ox: (r.left + r.width / 2) / sz.W - 0.5, oy: (r.top + r.height / 2) / sz.H - 0.5, fit: Math.min(r.width / (kw * base), r.height / (kh * base)) * 0.9, opacity: 1 };
      pose = reduceMotion ? (c > 0.5 ? land : pose) : { ...mixPose(pose, land, ease(c)), track: c > 0.6 };
    }
  }
  return pose;
}

// Phones: the canvas sits inside whichever box on the page is most in view (top of the hero,
// the skills section, beside the contact details) and scrolls with it, so it never lags.
const SLOTS = ['.hero-slot', '.inside-slot', '.chip-slot'];
function pickSlot() {
  const vh = window.innerHeight;
  let best = null, score = 0;
  for (const q of SLOTS) {
    const el = document.querySelector(q);
    if (!el || !el.offsetParent) continue;
    const r = el.getBoundingClientRect();
    const seen = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0)) / Math.max(1, r.height);
    if (seen > score + 0.001) { score = seen; best = el; }
  }
  return score > 0.02 ? best : null;
}
function slotPose(el) {
  const S = SHOTS.mobile, w = el.clientWidth, h = el.clientHeight;
  if (el.classList.contains('inside-slot')) {
    const p = M.pinST ? M.pinST.progress : 0;
    const shot = reduceMotion ? { ...S.hero } : insideShot(S, p);
    return { ...shot, ox: 0, oy: 0, fit: fitIn(w, h, reduceMotion ? 'whole' : 'apart'), opacity: 1 };
  }
  const shot = el.classList.contains('hero-slot') ? S.hero : S.outro;
  return { ...shot, ox: 0, oy: 0, fit: fitIn(w, h, 'whole'), opacity: 1 };
}

export default function Stage() {
  const host = useRef(null);
  useEffect(() => {
    let engine = null, alive = true, canvas = null, mode = '', slot = null;
    const hidden = () => ({ ...SHOTS.mobile.hero, opacity: 0 });
    const place = (parent) => { if (canvas.parentNode !== parent) parent.appendChild(canvas); };
    const tick = (time, deltaMS) => {
      if (!engine || document.hidden) return;
      const dt = Math.min(deltaMS / 1000, 0.05);
      const m = isMobile() ? 'slot' : 'fixed';
      if (m !== mode) {
        mode = m; slot = null;
        canvas.classList.toggle('slotted', m === 'slot');
        if (m === 'fixed') { place(host.current); engine.setViewport(null); }
      }
      if (mode === 'fixed') { engine.update(desktopPose(), dt); return; }
      const next = pickSlot();
      if (next !== slot) {
        slot = next;
        if (slot) { place(slot); engine.setViewport(slot.clientWidth, slot.clientHeight); engine.fadeFromZero(); }
      }
      engine.update(slot ? slotPose(slot) : hidden(), dt);
    };
    const onResize = () => {
      if (!engine) return;
      if (mode === 'slot' && slot) engine.setViewport(slot.clientWidth, slot.clientHeight);
      else engine.resize();
    };
    const onMove = (e) => {
      if (e.pointerType === 'touch' || reduceMotion) return;
      engine?.setPointer(e.clientX / window.innerWidth * 2 - 1, e.clientY / window.innerHeight * 2 - 1);
    };
    (async () => {
      // the 3D code loads after the page text, so the words are readable straight away
      const [mod] = await Promise.all([import('./chip/engine.js'), document.fonts.load("800 40px 'Encode Sans'").catch(() => {})]);
      if (!alive) return;
      SHOTS = mod.SHOTS; mixPose = mod.mixPose;
      canvas = document.createElement('canvas');
      canvas.className = 'stage';
      canvas.setAttribute('aria-hidden', 'true');
      host.current.appendChild(canvas);
      const lite = window.matchMedia('(hover: none), (max-width: 899px)').matches;
      engine = mod.createEngine(canvas, { reduce: reduceMotion, lite, onFrame: (f) => M.onFrame?.(f) });
      if (!engine) { canvas.remove(); document.documentElement.classList.add('no-webgl'); return; }
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
      canvas?.remove();
    };
  }, []);
  return <div ref={host} className="stage-host" aria-hidden="true" />;
}
