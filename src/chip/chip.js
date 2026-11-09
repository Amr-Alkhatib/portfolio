// A processor package built entirely from code, in real millimetres.
// Layers, top to bottom: lid, SRAM die, compute die, neural die, substrate, ball grid.
import * as THREE from 'three';

const TAU = Math.PI * 2;

function roundedRect(w, h, r, path = new THREE.Shape()) {
  const x = -w / 2, y = -h / 2;
  path.moveTo(x + r, y);
  path.lineTo(x + w - r, y);
  path.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  path.lineTo(x + w, y + h - r);
  path.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  path.lineTo(x + r, y + h);
  path.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  path.lineTo(x, y + r);
  path.absarc(x + r, y + r, r, Math.PI, 1.5 * Math.PI, false);
  return path;
}

// Extruded rounded slab, bottom at y=0, top at y=h. Cap UVs are shape coordinates in mm.
function slab(w, d, h, r, bevel, hole) {
  const shape = roundedRect(w - 2 * bevel, d - 2 * bevel, Math.max(r - bevel, 0.05));
  if (hole) shape.holes.push(roundedRect(hole.w + 2 * bevel, hole.d + 2 * bevel, hole.r + bevel, new THREE.Path()));
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: h - 2 * bevel, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel,
    bevelSegments: 4, curveSegments: 16,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, bevel, 0);
  g.computeVertexNormals();
  return g;
}

function canvasTex(w, h, draw, { color = true, mm } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  draw(ctx, w, h);
  const t = new THREE.CanvasTexture(c);
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  if (mm) { t.repeat.set(1 / mm[0], 1 / mm[1]); t.offset.set(0.5, 0.5); }
  return t;
}

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ---------- textures ----------
function brushedRoughness(mm) {
  return canvasTex(1024, 1024, (ctx, w, h) => {
    const r = rng(7);
    ctx.fillStyle = 'rgb(118,118,118)';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const y = r() * h, v = 95 + r() * 70;
      ctx.strokeStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.35})`;
      ctx.lineWidth = 0.6 + r() * 1.4;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y + (r() - 0.5) * 3); ctx.stroke();
    }
  }, { color: false, mm });
}

function lidMarking(font) {
  // 34 x 34 mm lid, 30 px per mm
  return canvasTex(1020, 1020, (ctx, w) => {
    const px = w / 34;
    ctx.clearRect(0, 0, w, w);
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'alphabetic';
    if ('fontStretch' in ctx) ctx.fontStretch = 'expanded';
    const left = 5 * px;
    ctx.font = `800 ${2.5 * px}px ${font}`;
    ctx.fillText('AMR ALKHATIB', left, 13.2 * px);
    ctx.font = `500 ${1.45 * px}px ${font}`;
    ctx.fillText('INFORMATION ENGINEERING', left, 16.4 * px);
    ctx.fillText('TUM HEILBRONN', left, 18.6 * px);
    ctx.font = `500 ${1.2 * px}px ${font}`;
    ctx.globalAlpha = 0.75;
    ctx.fillText('AA-25  HN  2M9 1186', left, 23.6 * px);
    ctx.fillText('LOT 0KTOB25  MADE IN CODE', left, 25.5 * px);
    ctx.globalAlpha = 1;
    // pin-1 triangle
    ctx.beginPath();
    ctx.moveTo(3 * px, 3 * px); ctx.lineTo(6 * px, 3 * px); ctx.lineTo(3 * px, 6 * px); ctx.closePath(); ctx.fill();
    // 2D code
    const r = rng(42), cell = 0.38 * px, ox = 23.8 * px, oy = 22 * px, n = 12;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const edge = i === 0 || j === 0 || (i === n - 1 && j % 2 === 0) || (j === n - 1 && i % 2 === 0);
      if (edge || r() > 0.52) ctx.fillRect(ox + i * cell, oy + j * cell, cell * 0.92, cell * 0.92);
    }
  });
}

function dieTex(kind) {
  // 20 x 16 mm die, 48 px per mm
  const W = 960, H = 768, px = 48;
  return canvasTex(W, H, (ctx) => {
    const r = rng(kind === 'sram' ? 3 : kind === 'core' ? 5 : 9);
    ctx.fillStyle = '#0b0e18';
    ctx.fillRect(0, 0, W, H);
    // seal ring
    ctx.strokeStyle = 'rgba(214,176,92,0.55)';
    ctx.lineWidth = 0.35 * px;
    ctx.strokeRect(0.5 * px, 0.5 * px, W - px, H - px);
    // bond pads
    ctx.fillStyle = 'rgba(214,176,92,0.65)';
    for (let x = 1.4; x < 18.8; x += 0.7) { ctx.fillRect(x * px, 1.05 * px, 0.32 * px, 0.32 * px); ctx.fillRect(x * px, (16 - 1.37) * px, 0.32 * px, 0.32 * px); }
    for (let y = 1.8; y < 14.4; y += 0.7) { ctx.fillRect(1.05 * px, y * px, 0.32 * px, 0.32 * px); ctx.fillRect((20 - 1.37) * px, y * px, 0.32 * px, 0.32 * px); }
    const x0 = 2 * px, y0 = 2 * px, w = 16 * px, h = 12 * px;
    if (kind === 'sram') {
      // 8 x 4 SRAM banks with bit-line texture
      const cols = 8, rows = 4, g = 0.28 * px;
      const bw = (w - g * (cols - 1)) / cols, bh = (h - g * (rows - 1)) / rows;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = x0 + i * (bw + g), y = y0 + j * (bh + g);
        ctx.fillStyle = `rgba(${70 + r() * 20},${80 + r() * 20},${150 + r() * 30},0.55)`;
        ctx.fillRect(x, y, bw, bh);
        ctx.strokeStyle = 'rgba(190,200,255,0.18)';
        ctx.lineWidth = 1;
        for (let k = 3; k < bw; k += 4) { ctx.beginPath(); ctx.moveTo(x + k, y); ctx.lineTo(x + k, y + bh); ctx.stroke(); }
        ctx.fillStyle = 'rgba(214,176,92,0.5)';
        ctx.fillRect(x, y + bh * 0.46, bw, 0.12 * px);
      }
    } else if (kind === 'core') {
      // 8 cores around a shared ring bus
      const cols = 4, rows = 2, g = 0.5 * px;
      const cw = (w - g * (cols - 1)) / cols, ch = (h - g * 3) / 2 - 0.6 * px;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
        const x = x0 + i * (cw + g), y = j === 0 ? y0 : y0 + h - ch;
        ctx.fillStyle = 'rgba(44,52,92,0.9)';
        ctx.fillRect(x, y, cw, ch);
        // sub-blocks: ALUs, register file, L1
        const sub = [[0.06, 0.08, 0.5, 0.38, 'rgba(120,138,230,0.55)'], [0.6, 0.08, 0.34, 0.38, 'rgba(214,176,92,0.45)'],
          [0.06, 0.54, 0.88, 0.18, 'rgba(90,110,200,0.5)'], [0.06, 0.78, 0.42, 0.16, 'rgba(160,170,240,0.35)'], [0.52, 0.78, 0.42, 0.16, 'rgba(160,170,240,0.35)']];
        for (const [a, b, c, d, col] of sub) { ctx.fillStyle = col; ctx.fillRect(x + a * cw, y + b * ch, c * cw, d * ch); }
      }
      ctx.strokeStyle = 'rgba(214,176,92,0.75)';
      ctx.lineWidth = 0.22 * px;
      ctx.strokeRect(x0 + 0.2 * px, y0 + h / 2 - 0.7 * px, w - 0.4 * px, 1.4 * px);
    } else {
      // neural engine: 16 x 12 MAC array with buffers on two sides
      ctx.fillStyle = 'rgba(214,176,92,0.35)';
      ctx.fillRect(x0, y0, w * 0.12, h);
      ctx.fillRect(x0 + w * 0.88, y0, w * 0.12, h);
      const ax = x0 + w * 0.15, aw = w * 0.7, n = 16, m = 12, g = 0.12 * px;
      const cw = (aw - g * (n - 1)) / n, chh = (h - g * (m - 1)) / m;
      for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) {
        const t = r();
        ctx.fillStyle = `rgba(${90 + t * 60},${100 + t * 40},${210 + t * 40},${0.35 + t * 0.35})`;
        ctx.fillRect(ax + i * (cw + g), y0 + j * (chh + g), cw, chh);
      }
    }
  }, { mm: [20, 16] });
}

function substrateTex() {
  // 40 x 40 mm, 25 px per mm
  const S = 1000, px = 25;
  return canvasTex(S, S, (ctx) => {
    const r = rng(11);
    ctx.fillStyle = '#0d1630';
    ctx.fillRect(0, 0, S, S);
    // fan-out traces
    ctx.strokeStyle = 'rgba(120,150,230,0.16)';
    ctx.lineWidth = 0.12 * px;
    for (let i = 0; i < 160; i++) {
      const a = (i / 160) * TAU, x1 = S / 2 + Math.cos(a) * 11 * px, y1 = S / 2 + Math.sin(a) * 9 * px;
      const x2 = S / 2 + Math.cos(a) * 19 * px, y2 = S / 2 + Math.sin(a) * 19 * px;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo((x1 + x2) / 2 + (r() - 0.5) * 20, (y1 + y2) / 2 + (r() - 0.5) * 20); ctx.lineTo(x2, y2); ctx.stroke();
    }
    // gold land pads around the border
    ctx.fillStyle = 'rgba(226,182,90,0.9)';
    for (let k = 1.6; k < 38.6; k += 1.1) {
      ctx.fillRect(k * px, 0.7 * px, 0.6 * px, 0.6 * px); ctx.fillRect(k * px, 38.7 * px, 0.6 * px, 0.6 * px);
      ctx.fillRect(0.7 * px, k * px, 0.6 * px, 0.6 * px); ctx.fillRect(38.7 * px, k * px, 0.6 * px, 0.6 * px);
    }
    // die attach area
    ctx.fillStyle = 'rgba(30,40,70,1)';
    ctx.fillRect(10 * px, 12 * px, 20 * px, 16 * px);
    ctx.fillStyle = 'rgba(226,182,90,0.55)';
    for (let x = 10.6; x < 29.6; x += 0.8) for (let y = 12.6; y < 27.6; y += 0.8) ctx.fillRect(x * px, y * px, 0.22 * px, 0.22 * px);
    // fiducials
    ctx.fillStyle = 'rgba(226,182,90,0.95)';
    for (const [x, y] of [[2.6, 2.6], [37.4, 37.4]]) { ctx.beginPath(); ctx.arc(x * px, y * px, 0.5 * px, 0, TAU); ctx.fill(); }
  }, { mm: [40, 40] });
}

// ---------- materials ----------
function materials(font, lite) {
  const brushed = brushedRoughness([34, 34]);
  const satin = new THREE.MeshPhysicalMaterial({
    color: '#c9ccd3', metalness: 1, roughness: 0.82, roughnessMap: brushed,
    anisotropy: lite ? 0 : 0.5, anisotropyRotation: 0, clearcoat: 0.0,
  });
  const polished = new THREE.MeshPhysicalMaterial({ color: '#d9dbe0', metalness: 1, roughness: 0.07 });
  const marking = new THREE.MeshStandardMaterial({
    color: '#3b3f4a', metalness: 0.2, roughness: 0.9, alphaMap: null, transparent: true,
    polygonOffset: true, polygonOffsetFactor: -2, depthWrite: false,
  });
  const markTex = lidMarking(font);
  marking.map = null;
  marking.alphaMap = markTex;
  marking.alphaMap.colorSpace = THREE.NoColorSpace;

  const die = (kind) => { const tex = dieTex(kind); return [
    new THREE.MeshPhysicalMaterial({
      color: '#ffffff', map: tex, emissiveMap: tex, metalness: 0.15, roughness: 0.32,
      emissive: '#ffffff', emissiveIntensity: 0.32,
      iridescence: lite ? 0 : 0.9, iridescenceIOR: 1.7, iridescenceThicknessRange: [200, 700],
      clearcoat: lite ? 0 : 0.6, clearcoatRoughness: 0.12, envMapIntensity: 0.55,
    }),
    new THREE.MeshPhysicalMaterial({ color: '#1a1f2e', metalness: 0.7, roughness: 0.28 }),
  ]; };
  const substrate = [
    new THREE.MeshPhysicalMaterial({ color: '#ffffff', map: substrateTex(), roughness: 0.55, metalness: 0.05, clearcoat: lite ? 0 : 0.35, clearcoatRoughness: 0.35, envMapIntensity: 0.6 }),
    new THREE.MeshPhysicalMaterial({ color: '#c79a4a', roughness: 0.5, metalness: 0.4 }),
  ];
  const solder = new THREE.MeshPhysicalMaterial({ color: '#cfd2d8', metalness: 1, roughness: 0.22 });
  const capBody = new THREE.MeshStandardMaterial({ color: '#8a6a43', roughness: 0.6 });
  const capEnd = new THREE.MeshStandardMaterial({ color: '#d7d9de', metalness: 1, roughness: 0.25 });
  return { satin, polished, marking, die, substrate, solder, capBody, capEnd };
}

// ---------- the object ----------
export function buildChip({ font = 'sans-serif', lite = false } = {}) {
  const M = materials(font, lite);
  const root = new THREE.Group();
  const parts = [];
  const add = (name, obj, base, lift, order) => {
    obj.position.y = base;
    root.add(obj);
    parts.push({ name, obj, base, lift, order });
    return obj;
  };

  // ball grid (22 x 22 at 1.5 mm pitch)
  const ballG = lite ? new THREE.SphereGeometry(0.34, 8, 6) : new THREE.SphereGeometry(0.34, 16, 10);
  const n = 22, pitch = 1.5;
  const balls = new THREE.InstancedMesh(ballG, M.solder, n * n);
  const m4 = new THREE.Matrix4();
  let k = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = (i - (n - 1) / 2) * pitch, z = (j - (n - 1) / 2) * pitch;
    const ring = Math.max(Math.abs(i - 10.5), Math.abs(j - 10.5));
    if (ring < 3.5 && ring > 2.5) continue;
    m4.makeScale(1, 0.82, 1).setPosition(x, 0, z);
    balls.setMatrixAt(k++, m4);
  }
  balls.count = k;
  add('balls', balls, -1.4 - 0.26, -7, 0.1);

  // substrate with a few capacitors on the border
  const sub = new THREE.Group();
  const subMesh = new THREE.Mesh(slab(40, 40, 1.4, 1.2, 0.12), M.substrate);
  subMesh.position.y = -1.4;
  sub.add(subMesh);
  const capG = new THREE.BoxGeometry(1.0, 0.5, 0.5), endG = new THREE.BoxGeometry(0.22, 0.52, 0.52);
  const caps = [[-18.2, -14], [-18.2, -11], [-18.2, 11], [-18.2, 14], [18.2, -14], [18.2, -11], [18.2, 11], [18.2, 14]];
  for (const [x, z] of caps) {
    const c = new THREE.Group();
    c.add(new THREE.Mesh(capG, M.capBody));
    const e1 = new THREE.Mesh(endG, M.capEnd); e1.position.x = -0.42; c.add(e1);
    const e2 = new THREE.Mesh(endG, M.capEnd); e2.position.x = 0.42; c.add(e2);
    c.rotation.y = Math.PI / 2; c.position.set(x, 0.25, z);
    sub.add(c);
  }
  add('substrate', sub, 0, 0, 0.2);

  // three stacked dies
  const dieG = slab(20, 16, 0.72, 0.3, 0.06);
  add('neural', new THREE.Mesh(dieG, M.die('npu')), 0.08, 6.5, 0.4);
  add('compute', new THREE.Mesh(dieG, M.die('core')), 0.82, 13.5, 0.6);
  add('sram', new THREE.Mesh(dieG, M.die('sram')), 1.56, 21, 0.8);

  // lid: rim + top plate, satin top with polished edges, laser marking
  const lid = new THREE.Group();
  const rim = new THREE.Mesh(slab(34, 34, 2.7, 2.6, 0.3, { w: 29, d: 29, r: 1.6 }), [M.satin, M.polished]);
  lid.add(rim);
  const top = new THREE.Mesh(slab(34, 34, 1.1, 2.6, 0.35), [M.satin, M.polished]);
  top.position.y = 2.6;
  lid.add(top);
  const mark = new THREE.Mesh(new THREE.PlaneGeometry(34, 34), M.marking);
  mark.rotation.x = -Math.PI / 2;
  mark.position.y = 3.701;
  lid.add(mark);
  add('lid', lid, 0, 31, 1.0);

  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  function explode(e) {
    for (const p of parts) {
      const delay = (1 - p.order) * 0.42;
      const t = ease((e - delay) / 0.58);
      p.obj.position.y = p.base + p.lift * t;
      p.t = t;
    }
  }
  // local anchor on each part's right edge, relative to its resting position
  root.updateMatrixWorld(true);
  for (const p of parts) {
    const b = new THREE.Box3().setFromObject(p.obj);
    p.anchor = new THREE.Vector3(b.max.x, (b.min.y + b.max.y) / 2 - p.base, (b.min.z + b.max.z) / 2);
    p.t = 0;
  }
  return { root, parts, explode, materials: M };
}

// Photo-studio environment: dark room, an off-axis key softbox, two strip lights, a warm top bounce.
export function buildStudio() {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.BoxGeometry(140, 90, 140), new THREE.MeshBasicMaterial({ color: '#04060c', side: THREE.BackSide })));
  const panel = (w, h, intensity, pos, color = '#ffffff') => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }));
    m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m); return m;
  };
  panel(34, 20, 2.1, [-16, 36, -34]);           // key softbox, off-axis behind: sweeps across the lid
  panel(2.6, 40, 7.5, [36, 8, 6]);              // strip light, right edge line
  panel(2.6, 40, 5.0, [-34, 8, -10]);           // strip light, left edge line
  panel(22, 6, 1.6, [34, 22, -30], '#ffcf86');  // warm bounce, picks out gold edges
  panel(40, 12, 0.35, [0, 10, 44]);             // faint front fill
  return s;
}
