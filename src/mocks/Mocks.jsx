// Live recreations of each app's main screen. Logic ported from the previous site.
import { useEffect, useRef } from 'react';
import { useLang } from '../i18n.jsx';
import { reduceMotion } from '../motion.js';
import './mocks.css';

const inView = (el, cb) => { const io = new IntersectionObserver((es) => cb(es[0].isIntersecting), { threshold: 0.2 }); io.observe(el); return () => io.disconnect(); };

export function MockVisually() {
  const { t, num, lang } = useLang();
  const root = useRef(null);
  useEffect(() => {
    const el = root.current, grid = el.querySelector('.mv-grid'); grid.replaceChildren();
    const rows = [];
    for (let k = 0; k < 8; k++) { const r = document.createElement('div'); r.className = 'mv-set'; r.innerHTML = '<b>Set ' + k + '</b><span class="tg">--</span><span class="st"></span>'; grid.appendChild(r); rows.push({ el: r, tg: r.querySelector('.tg'), st: r.querySelector('.st'), s: 'empty' }); }
    const trace = [0x100, 0x104, 0x110, 0x120, 0x108, 0x130, 0x150, 0x100, 0x160, 0x114, 0x200, 0x204, 0x170, 0x100, 0x124, 0x300, 0x134, 0x140, 0x154, 0x104, 0x164, 0x110];
    let tags = Array(8).fill(null), hits = 0, n = 0, i = 0, hist = [], last = null;
    const hitEl = el.querySelector('.vHit'), amat = el.querySelector('.vAmat'), addr = el.querySelector('.vAddr'), res = el.querySelector('.vRes'), wave = el.querySelector('.mv-wave');
    const pct = (v) => num(v, 1) + (lang === 'de' ? ' %' : '%');
    const labels = () => { rows.forEach((r) => { r.st.textContent = t(r.s); }); if (n) { hitEl.textContent = pct(hits / n * 100); amat.textContent = num(1 + (1 - hits / n) * 100, 1) + ' ' + t('cycles'); } if (last) res.textContent = t(last.hit ? 'hit' : 'miss') + ', ' + t('set') + ' ' + last.set; };
    const drawWave = () => { const s = 400 / 14; let c = '', h = '', m = ''; hist.forEach((v, k) => { const x = k * s; c += x + ',13 ' + x + ',3 ' + (x + s / 2) + ',3 ' + (x + s / 2) + ',13 '; h += x + ',' + (v ? 24 : 34) + ' ' + (x + s) + ',' + (v ? 24 : 34) + ' '; m += x + ',' + (v ? 56 : 46) + ' ' + (x + s) + ',' + (v ? 56 : 46) + ' '; });
      wave.innerHTML = '<polyline points="' + c + '" fill="none" stroke="#4a8cff" stroke-width="2"/><polyline points="' + h + '" fill="none" stroke="#34c778" stroke-width="2"/><polyline points="' + m + '" fill="none" stroke="#f05050" stroke-width="2"/>'; };
    const step = (flash) => {
      if (i >= trace.length) { i = 0; tags = Array(8).fill(null); hits = 0; n = 0; rows.forEach((r) => { r.tg.textContent = '--'; r.s = 'empty'; }); }
      const a = trace[i++], set = (a >> 4) & 7, tag = a >> 7, hit = tags[set] === tag; if (!hit) tags[set] = tag; n++; if (hit) hits++;
      const r = rows[set]; r.tg.textContent = '0x' + tag.toString(16).toUpperCase(); r.s = hit ? 'hit' : 'miss';
      if (flash) { r.el.classList.remove('hit', 'miss'); void r.el.offsetWidth; r.el.classList.add(hit ? 'hit' : 'miss'); setTimeout(() => r.el.classList.remove('hit', 'miss'), 700); }
      addr.textContent = '0x' + a.toString(16).toUpperCase().padStart(3, '0'); last = { hit, set }; res.style.color = hit ? '#34c778' : '#f07070';
      labels(); hist.push(hit); if (hist.length > 14) hist.shift(); drawWave();
    };
    for (let k = 0; k < 7; k++) step(false);
    if (reduceMotion) return;
    let timer = 0;
    const off = inView(el, (on) => { clearInterval(timer); if (on) timer = setInterval(() => step(true), 900); });
    return () => { off(); clearInterval(timer); };
  }, [t, num, lang]);
  return (
    <div className="mock mv" ref={root} role="img" aria-label={t('v.aria')}>
      <div className="mv-top"><span className="mv-logo">Visually.</span><span className="mv-tag">{t('v.tag')}</span></div>
      <div className="mv-body">
        <div className="mv-grid" />
        <div className="mv-side">
          <div className="mv-stat"><small>{t('v.hitrate')}</small><strong className="vHit">0%</strong></div>
          <div className="mv-stat"><small>AMAT</small><strong className="vAmat">1.0 cycles</strong></div>
          <div className="mv-stat"><small>{t('v.last')}</small><strong className="vAddr">0x000</strong><em className="vRes">&nbsp;</em></div>
        </div>
      </div>
      <div className="mv-waverow"><span>CLK<br />HIT<br />MISS</span><svg className="mv-wave" viewBox="0 0 400 60" preserveAspectRatio="none" /></div>
    </div>
  );
}

const WC = { ChiangMai: ['Chiang Mai', 'Chiang Mai', 'Thailand', 'Thailand'], Tbilisi: ['Tbilisi', 'Tiflis', 'Georgia', 'Georgien'], Ubud: ['Ubud', 'Ubud', 'Indonesia', 'Indonesien'],
  LuangPrabang: ['Luang Prabang', 'Luang Prabang', 'Laos', 'Laos'], Tokyo: ['Tokyo', 'Tokio', 'Japan', 'Japan'], Prague: ['Prague', 'Prag', 'Czechia', 'Tschechien'],
  Singapore: ['Singapore', 'Singapur', 'Singapore', 'Singapur'], Vienna: ['Vienna', 'Wien', 'Austria', 'Österreich'], ElNido: ['El Nido', 'El Nido', 'Philippines', 'Philippinen'],
  Split: ['Split', 'Split', 'Croatia', 'Kroatien'], Busan: ['Busan', 'Busan', 'South Korea', 'Südkorea'], Kotor: ['Kotor', 'Kotor', 'Montenegro', 'Montenegro'] };
const WP = [
  { name: ['Backpacker, €40 a day, nature and food', 'Backpacker, 40 € am Tag, Natur und Essen'], rows: [['ChiangMai', 81, [26.4, 18.6, 14, 21.5]], ['Tbilisi', 81, [27.3, 18.6, 14, 21.5]], ['Ubud', 80, [26.2, 18.1, 14, 21.5]], ['LuangPrabang', 79, [26.4, 18.4, 14, 20.2]]],
    top: { sum: ['Mountain temples, elephant sanctuaries and a slow northern pace.', 'Bergtempel, Elefantenschutzgebiete und ein ruhiges Tempo im Norden.'], cost: [24, 50], safe: [85, ['Safe', 'Sicher']], best: ['Nature', 'Natur'] } },
  { name: ['Safety first, culture and cities', 'Sicherheit zuerst, Kultur und Städte'], rows: [['Tokyo', 88, [27.8, 23, 14, 23]], ['Prague', 87, [28.6, 22, 14, 22]], ['Singapore', 87, [28.1, 23.5, 14, 21.8]], ['Vienna', 87, [28.1, 22.5, 14, 22.5]]],
    top: { sum: ['A blend of ancient tradition and cutting-edge modernity.', 'Eine Mischung aus alter Tradition und modernster Technik.'], cost: [55, 110], safe: [92, ['Safe', 'Sicher']], best: ['Culture', 'Kultur'] } },
  { name: ['Beach break, €100 a day', 'Strandurlaub, 100 € am Tag'], rows: [['ElNido', 83, [28.3, 16.7, 14, 24]], ['Split', 83, [27.6, 19, 14, 22]], ['Busan', 82, [27.7, 18.8, 14, 21]], ['Kotor', 82, [28.2, 18.8, 14, 21.5]]],
    top: { sum: ['Limestone lagoons and turquoise bays on Palawan’s northern tip.', 'Kalksteinlagunen und türkisfarbene Buchten an der Nordspitze von Palawan.'], cost: [28, 58], safe: [74, ['Moderate', 'Moderat']], best: ['Beach', 'Strand'] } }];

export function MockWanderly() {
  const { t, lang } = useLang();
  const root = useRef(null);
  useEffect(() => {
    const el = root.current, $ = (c) => el.querySelector('.' + c), list = $('wList'), card = $('mw-card'), els = {};
    list.replaceChildren(); let idx = 0, swap = 0;
    Object.keys(WC).forEach((k) => { const r = document.createElement('div'); r.className = 'mw-row'; r.style.top = '38cqw'; r.style.opacity = '0';
      r.innerHTML = '<span class="mw-rank"></span><span class="mw-name"><b></b><small></small><span class="mw-bar"><span class="k1"></span><span class="k2"></span><span class="k3"></span><span class="k4"></span></span></span><span class="mw-score"></span>';
      list.appendChild(r); els[k] = r; });
    const L = lang === 'de' ? 1 : 0;
    const fillCard = (p) => { const k = p.rows[0][0], x = p.top; $('wCity').textContent = WC[k][L]; $('wCountry').textContent = WC[k][2 + L]; $('mw-sum').textContent = x.sum[L];
      $('wBudget').textContent = L ? x.cost[0] + '–' + x.cost[1] + ' € am Tag' : '€' + x.cost[0] + '–' + x.cost[1] + ' a day';
      $('wSafety').textContent = x.safe[0] + '/100, ' + x.safe[1][L]; $('wBest').textContent = x.best[L]; };
    const render = (animate) => { const p = WP[idx], on = new Set(p.rows.map((r) => r[0])); $('mw-profile').textContent = p.name[L];
      Object.keys(els).forEach((k) => { if (!on.has(k)) { els[k].style.top = '38cqw'; els[k].style.opacity = '0'; } });
      p.rows.forEach(([k, score, f], i) => { const r = els[k]; r.style.top = (i * 9.3) + 'cqw'; r.style.opacity = '1';
        r.querySelector('.mw-rank').textContent = i + 1; r.querySelector('b').textContent = WC[k][L]; r.querySelector('small').textContent = WC[k][2 + L];
        r.querySelectorAll('.mw-bar span').forEach((s, j) => { s.style.width = f[j] + '%'; }); r.querySelector('.mw-score').textContent = score + '/100'; });
      clearTimeout(swap);
      if (animate) { card.classList.add('swap'); swap = setTimeout(() => { fillCard(p); card.classList.remove('swap'); }, 300); } else fillCard(p); };
    render(false);
    if (reduceMotion) return;
    let timer = 0;
    const off = inView(el, (v) => { clearInterval(timer); if (v) timer = setInterval(() => { idx = (idx + 1) % WP.length; render(true); }, 5200); });
    return () => { off(); clearInterval(timer); clearTimeout(swap); };
  }, [lang]);
  return (
    <div className="mock mw" ref={root} role="img" aria-label={t('w.aria')}>
      <div className="mw-top"><span className="mw-logo"><svg viewBox="0 0 24 24" aria-hidden="true"><path className="pin" d="M12 22s7-7.2 7-12.5a7 7 0 0 0-14 0C5 14.8 12 22 12 22z" /><path className="river" d="M9.6 17c1.8-1.5.8-3 2.8-4.2 1.3-.8 2.5-.6 3.3-1.6" /></svg>wanderly</span><span className="mw-profile">&nbsp;</span></div>
      <div className="mw-body">
        <div className="mw-col">
          <strong>{t('w.matches')}</strong>
          <div className="mw-list wList" />
          <span className="mw-legend"><i className="k1" /><span>{t('w.f1')}</span><i className="k2" /><span>{t('w.f2')}</span><i className="k3" /><span>{t('w.f3')}</span><i className="k4" /><span>{t('w.f4')}</span></span>
        </div>
        <div className="mw-card">
          <span className="mw-kicker">{t('w.expect')}</span>
          <div className="mw-city"><b className="wCity">&nbsp;</b><span className="wCountry" /></div>
          <p className="mw-sum" />
          <dl className="mw-facts">
            <div><dt>{t('w.budget')}</dt><dd className="wBudget" /></div>
            <div><dt>{t('w.f2')}</dt><dd className="wSafety" /></div>
            <div><dt>{t('w.best')}</dt><dd className="wBest" /></div>
          </dl>
          <div className="mw-btns"><span className="go">{t('w.plan')}</span><span className="alt">{t('w.compare')}</span></div>
        </div>
      </div>
    </div>
  );
}

const TS = [
  { pkg: ['Afterwork Party', 'Afterwork-Party'], title: ['Campus summer party', 'Sommerfest auf dem Campus'], meta: ['26.06.2026, 17:00–23:00, 120 guests, Stuttgart', '26.06.2026, 17:00–23:00, 120 Gäste, Stuttgart'],
    flags: [['Private campus: landowner consent', 'Privatgelände: Zustimmung des Eigentümers']], trucks: ['Curry Up (vegan)', 'Taco Loco (vegan)', 'Smokey Joe'], guests: 120, extra: 0 },
  { pkg: ['Custom event', 'Individuelles Event'], title: ['Christmas market', 'Weihnachtsmarkt'], meta: ['25.12.2026, 12:00–18:00, 500 guests, Stuttgart', '25.12.2026, 12:00–18:00, 500 Gäste, Stuttgart'],
    flags: [['Public holiday in Baden-Württemberg', 'Feiertag in Baden-Württemberg'], ['Crew rest day required (ArbZG)', 'Ruhetag für die Crew nötig (ArbZG)']], trucks: ['Curry Up', 'Pho Real', 'Smokey Joe', 'Taco Loco', 'Wurst Case Scenario', 'Espresso Express'], guests: 500, extra: 350 },
  { pkg: ['Afterwork Party', 'Afterwork-Party'], title: ['Afterwork on the Marktplatz', 'Afterwork auf dem Marktplatz'], meta: ['16.07.2026, 17:00–23:00, 90 guests, Heilbronn', '16.07.2026, 17:00–23:00, 90 Gäste, Heilbronn'],
    flags: [['Street-use permit from Stadt Heilbronn', 'Sondernutzungserlaubnis der Stadt Heilbronn'], ['Ends after 22:00 (TA Lärm)', 'Endet nach 22:00 Uhr (TA Lärm)']], trucks: ['Kebabylon (halal)', 'Spätzle Shuttle'], guests: 90, extra: 0 }];

export function MockTruckOps() {
  const { t, lang } = useLang();
  const root = useRef(null);
  useEffect(() => {
    const el = root.current, $ = (c) => el.querySelector('.' + c), Lx = (a) => a[lang === 'de' ? 1 : 0];
    const eur = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
    let idx = 0, shown = 0, timers = [];
    const chips = (box, list, cls) => { box.innerHTML = list.map((x) => '<span class="mt-chip ' + cls + '">' + x + '</span>').join(''); return [...box.children]; };
    const render = (s, animate) => {
      timers.forEach(clearTimeout); timers = [];
      const trucksN = s.trucks.filter((x) => x !== 'Espresso Express').length + (s.extra ? 1 : 0);
      const cat = s.guests * 14, travel = trucksN * 40, net = cat + travel + s.extra, v7 = cat * 0.07, v19 = (travel + s.extra) * 0.19, gross = net + v7 + v19;
      $('tPkg').textContent = Lx(s.pkg); $('tTitle').textContent = Lx(s.title); $('tMeta').textContent = Lx(s.meta);
      const all = [...chips($('tFlags'), s.flags.map(Lx), 'warn'), ...chips($('tTrucks'), s.trucks, '')];
      all.forEach((c, k) => animate ? timers.push(setTimeout(() => c.classList.add('in'), 120 + k * 110)) : c.classList.add('in'));
      $('mt-quote').innerHTML = '<h4>' + t('quote') + '</h4>' +
        '<div class="mt-row"><span>' + t('catering', s.guests) + '</span><span>' + eur.format(cat) + '</span></div>' +
        (s.extra ? '<div class="mt-row"><span>' + t('coffee') + '</span><span>' + eur.format(s.extra) + '</span></div>' : '') +
        '<div class="mt-row"><span>' + t('travel', trucksN) + '</span><span>' + eur.format(travel) + '</span></div>' +
        '<div class="mt-row"><span>' + t('vat7') + '</span><span>' + eur.format(v7) + '</span></div>' +
        '<div class="mt-row"><span>' + t('vat19') + '</span><span>' + eur.format(v19) + '</span></div>' +
        '<div class="mt-total"><span>' + t('total') + '</span><strong class="tGross">' + eur.format(animate ? shown : gross) + '</strong></div>';
      if (animate) { const from = shown, t0 = performance.now(); const run = (now) => { const p = Math.min(1, (now - t0) / 800), e = 1 - Math.pow(1 - p, 3), g = el.querySelector('.tGross'); if (g) g.textContent = eur.format(from + (gross - from) * e); if (p < 1) requestAnimationFrame(run); }; requestAnimationFrame(run); }
      shown = gross;
    };
    render(TS[0], false);
    if (reduceMotion) return;
    let timer = 0;
    const off = inView(el, (v) => { clearInterval(timer); if (v) timer = setInterval(() => { idx = (idx + 1) % TS.length; render(TS[idx], true); }, 5000); });
    return () => { off(); clearInterval(timer); timers.forEach(clearTimeout); };
  }, [t, lang]);
  return (
    <div className="mock mt" ref={root} role="img" aria-label={t('t.aria')}>
      <div className="mt-head"><span className="mt-logo">TruckOps</span><span className="mt-pill tPkg">Afterwork Party</span></div>
      <div className="mt-body">
        <div className="mt-left">
          <div className="mt-event"><strong className="tTitle">&nbsp;</strong><small className="tMeta">&nbsp;</small></div>
          <div><div className="mt-sub">{t('t.checks')}</div><div className="mt-chips tFlags" /></div>
          <div><div className="mt-sub">{t('t.matched')}</div><div className="mt-chips tTrucks" /></div>
        </div>
        <div className="mt-quote" />
      </div>
    </div>
  );
}

export function MockPitchRoom() {
  const { t, lang } = useLang();
  const root = useRef(null);
  useEffect(() => {
    const el = root.current, tr = el.querySelector('.mp-tr');
    tr.innerHTML = t('pitch').split(' ').map((w) => (lang === 'de' ? /^(ähm|äh),?$/i : /^(um|uh),?$/i).test(w) ? '<span class="w"><mark>' + w.replace(',', '') + '</mark>' + (w.endsWith(',') ? ',' : '') + '</span>' : '<span class="w">' + w + '</span>').join(' ');
    const words = [...tr.querySelectorAll('.w')], segs = [...el.querySelectorAll('.mp-seg')], rings = [...el.querySelectorAll('.mp-ring')], C = 2 * Math.PI * 44;
    rings.forEach((r) => { const fg = r.querySelector('.fg'); fg.style.strokeDasharray = C; fg.style.strokeDashoffset = C; });
    const setRings = (on) => rings.forEach((r) => { const v = +r.dataset.v; r.querySelector('.fg').style.strokeDashoffset = on ? C * (1 - v / 100) : C; const s = r.querySelector('strong');
      if (!on) { s.textContent = '0'; return; } const t0 = performance.now(); const run = (now) => { const p = Math.min(1, (now - t0) / 1400); s.textContent = Math.round(v * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(run); }; requestAnimationFrame(run); });
    let timers = [];
    const finalState = () => { words.forEach((w) => w.classList.add('in')); segs.forEach((s) => s.classList.add(s.dataset.c === '1' ? 'on' : 'miss')); rings.forEach((r) => { const v = +r.dataset.v; r.querySelector('.fg').style.strokeDashoffset = C * (1 - v / 100); r.querySelector('strong').textContent = v; }); };
    const play = () => { timers.forEach(clearTimeout); timers = []; words.forEach((w) => w.classList.remove('in')); segs.forEach((s) => s.classList.remove('on', 'miss')); setRings(false);
      const gap = 95, end = 250 + words.length * gap;
      words.forEach((w, k) => timers.push(setTimeout(() => w.classList.add('in'), 250 + k * gap)));
      segs.forEach((s, k) => timers.push(setTimeout(() => s.classList.add(s.dataset.c === '1' ? 'on' : 'miss'), 400 + k * (end / 6))));
      timers.push(setTimeout(() => setRings(true), end + 150)); timers.push(setTimeout(play, end + 5200)); };
    finalState();
    if (reduceMotion) return;
    const off = inView(el, (on) => { if (on) play(); else { timers.forEach(clearTimeout); timers = []; finalState(); } });
    return () => { off(); timers.forEach(clearTimeout); };
  }, [t, lang]);
  const segs = [['seg.problem', 1], ['seg.solution', 1], ['seg.market', 0], ['seg.traction', 0], [null, 0, 'Team'], [null, 1, 'Ask']];
  return (
    <div className="mock mp" ref={root} role="img" aria-label={t('p.aria')}>
      <div className="mp-head"><span className="mp-brand">Pitchroom</span><span className="mp-take">{t('p.take')}</span></div>
      <div className="mp-body">
        <div className="mp-rings">
          {[[81, 'p.delivery'], [58, 'p.readiness']].map(([v, k]) => (
            <div className="mp-ring" data-v={v} key={k}><svg viewBox="0 0 100 100"><circle className="bg" cx="50" cy="50" r="44" /><circle className="fg" cx="50" cy="50" r="44" /></svg><div><strong>0</strong><small>{t(k)}</small></div></div>
          ))}
        </div>
        <div className="mp-right"><p className="mp-quote">{t('p.quote')}</p><div className="mp-tr" /></div>
      </div>
      <div className="mp-structure">{segs.map(([k, c, l], i) => <span className="mp-seg" data-c={c} key={i}>{k ? t(k) : l}</span>)}</div>
    </div>
  );
}
