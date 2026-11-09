import { useEffect, useRef, useState } from 'react';
import { useLang, html, plain } from '../i18n.jsx';
import SplitText from '../bits/SplitText.jsx';
import { reduceMotion } from '../motion.js';

const NS = 'http://www.w3.org/2000/svg', W = 548, H = 300, X0 = -2.75, X1 = 2.75, Y0 = -6, Y1 = 6;
const sx = (x) => (x - X0) / (X1 - X0) * W, sy = (y) => H - (y - Y0) / (Y1 - Y0) * H;
const IDS = ['a', 'b', 'c', 'd'], DEF = { a: -5, b: 0, c: 4, d: 0 };

function Explorer() {
  const { t, num } = useLang();
  const svgRef = useRef(null), tagRef = useRef(null), readRef = useRef(null), api = useRef({});
  const [vals, setVals] = useState(DEF);
  const [playing, setPlaying] = useState(!reduceMotion);
  const fmt = (v, n = 1) => (v < 0 ? '−' : '') + num(Math.abs(v), n);

  useEffect(() => {
    const svg = svgRef.current, tag = tagRef.current, readout = readRef.current;
    svg.replaceChildren();
    const mk = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
    for (let x = -2.5; x <= 2.5; x += 0.5) svg.appendChild(mk('line', { x1: sx(x), y1: 0, x2: sx(x), y2: H, class: Number.isInteger(x) ? 'g1' : 'g2' }));
    for (let y = -6; y <= 6; y++) svg.appendChild(mk('line', { x1: 0, y1: sy(y), x2: W, y2: sy(y), class: y % 2 === 0 ? 'g1' : 'g2' }));
    svg.appendChild(mk('line', { x1: 0, y1: sy(0), x2: W, y2: sy(0), class: 'ax' }));
    svg.appendChild(mk('line', { x1: sx(0), y1: 0, x2: sx(0), y2: H, class: 'ax' }));
    for (const x of [-2, -1, 1, 2]) { const tx = mk('text', { x: sx(x) - (x < 0 ? 7 : 3), y: sy(0) + 18 }); tx.textContent = fmt(x, 0); svg.appendChild(tx); }
    for (const y of [-4, 4]) { const tx = mk('text', { x: sx(0) + 6, y: sy(y) + 4 }); tx.textContent = fmt(y, 0); svg.appendChild(tx); }
    const curve = mk('path', { class: 'curve' }); svg.appendChild(curve);
    const dots = mk('g', {}); svg.appendChild(dots);
    const probe = mk('g', { style: 'display:none' }); const pl = mk('line', { class: 'probe-line', y1: 0, y2: H }); const pd = mk('circle', { class: 'probe-dot', r: 5 }); probe.append(pl, pd); svg.appendChild(probe);
    let v = { ...api.current.v || DEF }, probeX = null;
    const f = (x) => x ** 5 + v.a * x ** 3 + v.b * x ** 2 + v.c * x + v.d;
    const realRoots = (N) => { const B = 1 + Math.max(Math.abs(v.a), Math.abs(v.b), Math.abs(v.c), Math.abs(v.d)), r = []; let px = -B, pf = f(px);
      for (let i = 1; i <= N; i++) { const x = -B + 2 * B * i / N, fx = f(x); if (pf === 0) r.push(px); else if (pf * fx < 0) { let lo = px, hi = x; for (let k = 0; k < 50; k++) { const m = (lo + hi) / 2; if (f(lo) * f(m) <= 0) hi = m; else lo = m; } r.push((lo + hi) / 2); } px = x; pf = fx; }
      if (pf === 0) r.push(px); return r; };
    const placeProbe = (x) => { const y = f(x), cy = Math.max(-8, Math.min(H + 8, sy(y))); pl.setAttribute('x1', sx(x)); pl.setAttribute('x2', sx(x)); pd.setAttribute('cx', sx(x)); pd.setAttribute('cy', cy);
      const box = svg.getBoundingClientRect(), k = box.width / W; tag.style.left = (sx(x) * k) + 'px'; tag.style.top = (Math.max(14, Math.min(H - 4, cy)) * k) + 'px';
      tag.textContent = 'x = ' + fmt(x, 2) + '   f(x) = ' + (Math.abs(y) > 999 ? (y < 0 ? '−' : '') + t('large') : fmt(y, 2)); };
    const draw = (N) => {
      let d = '', pen = false;
      for (let i = 0; i <= 480; i++) { const x = X0 + (X1 - X0) * i / 480, y = f(x); if (y < Y0 - 2 || y > Y1 + 2) { pen = false; continue; } d += (pen ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(y).toFixed(1) + ' '; pen = true; }
      curve.setAttribute('d', d.trim());
      const roots = realRoots(N || 5000); dots.replaceChildren(); let off = 0;
      for (const r of roots) { if (r < X0 || r > X1) { off++; continue; } dots.appendChild(mk('circle', { cx: sx(r).toFixed(1), cy: sy(0).toFixed(1), r: 7, class: 'root' })); }
      readout.textContent = t('roots', roots.length, off);
      if (probeX !== null) placeProbe(probeX);
    };
    const onMove = (e) => { const box = svg.getBoundingClientRect(); probeX = Math.max(X0, Math.min(X1, X0 + (e.clientX - box.left) / box.width * (X1 - X0))); probe.style.display = ''; tag.classList.add('on'); placeProbe(probeX); };
    const onLeave = () => { probeX = null; probe.style.display = 'none'; tag.classList.remove('on'); };
    svg.addEventListener('pointermove', onMove); svg.addEventListener('pointerleave', onLeave);
    api.current = { get v() { return v; }, set: (nv, N) => { v = nv; draw(N); } };
    draw();
    return () => { svg.removeEventListener('pointermove', onMove); svg.removeEventListener('pointerleave', onLeave); };
  }, [t, num]);

  // gentle drift while visible
  useEffect(() => {
    if (!playing) return;
    let raf = 0, visible = true, t0 = null, phase = api.current.phase || 0;
    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) raf = requestAnimationFrame(tick); else cancelAnimationFrame(raf); });
    const tick = (ts) => { if (t0 === null) t0 = ts - phase * 1000; const tt = (ts - t0) / 1000; api.current.phase = tt;
      const nv = { a: -5 + 2.2 * Math.sin(tt * 0.45), b: 1.6 * Math.sin(tt * 0.31 + 0.6), c: 4 + 2.0 * Math.sin(tt * 0.27 + 1.2), d: 1.4 * Math.sin(tt * 0.39 + 2.1) };
      api.current.set(nv, 2400); setVals(nv); if (visible) raf = requestAnimationFrame(tick); };
    io.observe(svgRef.current);
    return () => { cancelAnimationFrame(raf); io.disconnect(); };
  }, [playing]);

  const onSlide = (k) => (e) => { setPlaying(false); const nv = { ...api.current.v, [k]: parseFloat(e.target.value) }; api.current.set(nv); setVals(nv); };
  const reset = () => { setPlaying(false); api.current.phase = 0; api.current.set({ ...DEF }); setVals({ ...DEF }); };
  return (
    <figure className="explorer reveal" aria-label={t('ex.aria')}>
      <div className="explorer-top">
        <span className="formula">f(x) = x⁵ + ax³ + bx² + cx + d</span>
        <span className="readout" ref={readRef} aria-live="polite">5 real roots</span>
      </div>
      <div className="plot-wrap">
        <svg ref={svgRef} className="plot" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t('ex.plot')} />
        <span className="probe-tag" ref={tagRef} />
      </div>
      <div className="sliders">
        {IDS.map((k) => (
          <div className="slider" key={k}>
            <label htmlFor={'c' + k}>{k}</label>
            <input id={'c' + k} type="range" min="-8" max="8" step="0.1" value={vals[k].toFixed(1)} onChange={onSlide(k)} />
            <output htmlFor={'c' + k}>{fmt(vals[k])}</output>
          </div>
        ))}
      </div>
      <div className="explorer-foot">
        <figcaption className="caption" {...html(t('ex.caption'))} />
        <div className="controls">
          <button className="chipbtn" type="button" aria-pressed={playing} onClick={() => setPlaying((p) => !p)}>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M9 6v12M15 6v12" /> : <path d="M8 5v14l11-7z" />}</svg>
            <span>{playing ? t('pause') : t('animate')}</span>
          </button>
          <button className="chipbtn" type="button" onClick={reset}>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v5h5" /></svg><span>{t('ex.reset')}</span>
          </button>
        </div>
      </div>
    </figure>
  );
}

const ROWS = [['2026', 'm.r1s', 'm.r1w', null, 'TUM Business Game'], ['2026', 'm.r2s', 'm.r2w', null, 'TUM Business Game'], ['2026', 'm.r8s', 'm.r8w', 'w.chip'], ['2026', 'm.r3s', 'm.r3w', 'm.r3r'],
  ['2025', 'm.r4s', 'm.r4w', 'rec.tom'], ['2022', 'm.r5s', 'm.r5w', 'm.r5r'], ['2022', 'm.r6s', 'm.r6w', 'm.r6r'], ['2021', 'm.r7s', 'm.r7w', 'm.r7r']];

export default function Models() {
  const { t } = useLang();
  return (
    <section className="section" id="models" aria-labelledby="m-h">
      <div className="wrap">
        <div className="models-top">
          <div className="models-intro">
            <SplitText tag="h2" text={plain(t('m.h2'))} className="d2" splitType="lines" mask effect="rise" textAlign="left" duration={1} delay={80} />
            <span id="m-h" hidden>{plain(t('m.h2'))}</span>
            <p className="reveal">{plain(t('m.p'))} {t('m.p2')}</p>
          </div>
          <Explorer />
        </div>
        <div className="ledger" role="table" aria-label={t('m.aria')}>
          <div className="ledger-row head" role="row"><span role="columnheader">{t('m.year')}</span><span role="columnheader">System</span><span role="columnheader">{t('m.what')}</span><span role="columnheader">{t('m.rec')}</span></div>
          {ROWS.map(([y, s, w, r, rt]) => (
            <div className="ledger-row reveal" role="row" key={s}>
              <span className="yr" role="cell">{y}</span>
              <span className="sys" role="cell" {...html(t(s))} />
              <span className="what" role="cell" {...html(t(w))} />
              <span className="rec" role="cell" {...html(r ? t(r) : rt)} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
