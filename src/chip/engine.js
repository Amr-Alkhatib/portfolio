// The 3D world: one fixed canvas, one chip, one photo studio, and a camera that blends between shots.
import * as THREE from 'three';
import { buildChip, buildStudio } from './chip.js';

const D2R = Math.PI / 180;
const SNAP = typeof location !== 'undefined' && /[?&]snap\b/.test(location.search);   // test hook: no easing
const KEYS = ['ox', 'oy', 'polar', 'az', 'fit', 'ty', 'rot', 'explode', 'opacity', 'env'];

// Shots: ox/oy shift the object on screen (fractions of the viewport), fit is how much of the
// viewport the chip fills, explode takes it apart, env turns the studio light.
export const SHOTS = {
  desktop: {
    hero:    { ox: 0.22, oy: 0.05, polar: 50, az: 28, fit: 0.56, ty: 0, rot: -0.32, explode: 0, opacity: 1, env: -0.7 },
    lift:    { ox: 0.13, oy: 0.06, polar: 40, az: 21, fit: 0.66, ty: 2, rot: -0.36, explode: 0.12, opacity: 1, env: -0.25 },
    apart:   { ox: -0.19, oy: 0.06, polar: 68, az: 32, fit: 0.42, ty: 11, rot: -0.42, explode: 1, opacity: 1, env: 0.6 },
    rebuild: { ox: -0.06, oy: 0.02, polar: 56, az: 30, fit: 0.5, ty: 2, rot: -0.12, explode: 0, opacity: 0.85, env: 0.2 },
    park:    { ox: 0.43, oy: -0.37, polar: 48, az: 30, fit: 0.13, ty: 0, rot: 0.5, explode: 0, opacity: 0, env: -0.5 },
    outro:   { ox: 0.24, oy: -0.08, polar: 50, az: 28, fit: 0.5, ty: 0, rot: -0.32, explode: 0, opacity: 1, env: -0.7 },
  },
  mobile: {
    hero:    { ox: 0.0, oy: -0.3, polar: 50, az: 28, fit: 0.7, ty: 0, rot: -0.32, explode: 0, opacity: 1, env: -0.7 },
    lift:    { ox: 0.0, oy: -0.24, polar: 42, az: 22, fit: 0.78, ty: 2, rot: -0.36, explode: 0.12, opacity: 1, env: -0.25 },
    apart:   { ox: 0.0, oy: -0.1, polar: 66, az: 32, fit: 0.66, ty: 11, rot: -0.42, explode: 1, opacity: 1, env: 0.6 },
    rebuild: { ox: 0.0, oy: -0.1, polar: 56, az: 30, fit: 0.7, ty: 2, rot: -0.12, explode: 0, opacity: 0.6, env: 0.2 },
    park:    { ox: 0.32, oy: -0.4, polar: 48, az: 30, fit: 0.26, ty: 0, rot: 0.5, explode: 0, opacity: 0, env: -0.5 },
    outro:   { ox: 0.0, oy: 0.2, polar: 50, az: 28, fit: 0.5, ty: 0, rot: -0.32, explode: 0, opacity: 1, env: -0.7 },
  },
};

export const mixPose = (a, b, t) => { const o = {}; for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * t; return o; };

export function createEngine(canvas, { reduce = false, onFrame } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studio = buildStudio();
  scene.environment = pmrem.fromScene(studio, 0.02, 0.1, 400, { size: 256 }).texture;
  studio.traverse(o => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
  pmrem.dispose();

  const chip = buildChip({ font: "'Encode Sans', sans-serif" });
  scene.add(chip.root);
  const order = ['lid', 'sram', 'compute', 'neural', 'substrate', 'balls'];
  const parts = order.map(n => chip.parts.find(p => p.name === n));

  const camera = new THREE.PerspectiveCamera(26, 1, 1, 3000);
  const target = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  let W = 1, H = 1, dpr = Math.min(window.devicePixelRatio || 1, 1.75), maxDpr = dpr;
  const cur = { ...SHOTS.desktop.hero };
  let intro = reduce || SNAP ? 0 : 0.42;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
  let time = 0, lastSig = '', frames = 0, slowAcc = 0, skip = false;
  const anchors = parts.map(p => ({ name: p.name, x: 0, y: 0, t: 0 }));

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    renderer.setPixelRatio(dpr);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    lastSig = '';
  }

  function place(p) {
    const aspect = W / H;
    const dist = 97.4 / (Math.max(0.05, p.fit) * Math.min(aspect, 1));
    const ph = p.polar * D2R, th = p.az * D2R;
    target.set(0, p.ty, 0);
    camera.position.set(dist * Math.sin(ph) * Math.sin(th), p.ty + dist * Math.cos(ph), dist * Math.sin(ph) * Math.cos(th));
    camera.lookAt(target);
    camera.setViewOffset(W, H, -p.ox * W, -p.oy * H, W, H);
    camera.updateProjectionMatrix();
  }

  function update(goal, dt) {
    time += dt;
    const k = reduce || SNAP ? 1 : 1 - Math.exp(-dt * 5.5);
    // when the chip sits in a slot on the page, follow it tightly so it scrolls with the layout
    const kt = goal.track && !(reduce || SNAP) ? 1 - Math.exp(-dt * 24) : k;
    for (const key of KEYS) cur[key] += (goal[key] - cur[key]) * (key === 'ox' || key === 'oy' || key === 'fit' ? kt : k);
    pointer.sx += (pointer.x - pointer.sx) * (reduce ? 1 : 1 - Math.exp(-dt * 3));
    pointer.sy += (pointer.y - pointer.sy) * (reduce ? 1 : 1 - Math.exp(-dt * 3));

    const sway = reduce ? 0 : Math.sin(time * 0.35) * 0.05;
    chip.root.rotation.y = cur.rot + sway;
    chip.root.position.y = reduce ? 0 : Math.sin(time * 0.6) * 0.5;
    const e = Math.max(0, Math.min(1, Math.max(cur.explode, intro)));
    chip.explode(e);
    scene.environmentRotation.set(0.1 + pointer.sy * 0.45, cur.env - pointer.sx * 0.8, 0);
    place(cur);
    canvas.style.opacity = cur.opacity.toFixed(3);

    // project each layer's right edge to the screen for the callout leader lines
    chip.root.updateMatrixWorld(true);
    parts.forEach((p, i) => {
      tmp.copy(p.anchor); tmp.y += p.obj.position.y;
      chip.root.localToWorld(tmp).project(camera);
      anchors[i].x = (tmp.x + 1) / 2 * W; anchors[i].y = (1 - tmp.y) / 2 * H; anchors[i].t = p.t;
    });
    onFrame?.({ anchors, explode: e, pose: cur });

    // skip the draw when nothing visible changed (reduced motion, idle)
    const sig = reduce ? KEYS.map(k2 => cur[k2].toFixed(3)).join() + W + 'x' + H : '';
    if (reduce && sig === lastSig) return;
    lastSig = sig;
    if (cur.opacity < 0.02) return;
    if (!reduce && cur.opacity < 0.5) { skip = !skip; if (skip) return; }   // parked: half rate
    renderer.render(scene, camera);

    // adaptive quality: step the pixel ratio down if frames are slow
    if (!reduce && dt > 0) {
      frames++; slowAcc += dt > 1 / 45 ? 1 : 0;
      if (frames >= 90) {
        if (slowAcc > 45 && dpr > 1) { dpr = Math.max(1, dpr - 0.25); resize(); }
        else if (slowAcc < 5 && dpr < maxDpr) { dpr = Math.min(maxDpr, dpr + 0.25); resize(); }
        frames = 0; slowAcc = 0;
      }
    }
  }

  function settle(duration = 1.5) {
    // intro: the parts settle into place, top part last
    if (reduce) { intro = 0; return; }
    const start = performance.now(), from = intro;
    const run = (now) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      intro = from * Math.pow(1 - p, 3);
      if (p < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  }

  function setPointer(x, y) { pointer.x = x; pointer.y = y; }
  // a touch more exposure on the light page so the metal doesn't read as a dark hole
  function setTheme(t) { renderer.toneMappingExposure = t === 'light' ? 1.18 : 1.05; lastSig = ''; }

  // keep the GPU memory honest if the page is torn down
  function dispose() {
    chip.root.traverse(o => {
      o.geometry?.dispose?.();
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      ms.forEach(m => { for (const v of Object.values(m)) if (v && v.isTexture) v.dispose(); m.dispose(); });
    });
    scene.environment?.dispose();
    renderer.dispose();
  }

  resize();
  return { update, resize, settle, setPointer, setTheme, dispose, anchors };
}
