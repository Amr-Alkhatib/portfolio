import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLang, html, plain } from '../i18n.jsx';
import SplitText from '../bits/SplitText.jsx';
import DecryptedText from '../bits/DecryptedText.jsx';
import { M, ScrollTrigger, reduceMotion, isMobile } from '../motion.js';

// top to bottom, the order the layers come off
const LAYERS = [
  { part: 'lid', layer: 'in.lid', group: null, items: 'in.lidV' },
  { part: 'sram', layer: 'in.sram', group: 's.data', items: 's.dataV' },
  { part: 'compute', layer: 'in.core', group: 's.prog', items: 's.progV' },
  { part: 'neural', layer: 'in.npu', group: 's.ai', items: 's.aiV' },
  { part: 'substrate', layer: 'in.sub', group: 's.res', items: 's.resV' },
  { part: 'balls', layer: 'in.bga', group: 's.lang', items: 's.langV' },
];

export default function Inside() {
  const { t, lang } = useLang();
  const sec = useRef(null), svg = useRef(null), fill = useRef(null), items = useRef([]), paths = useRef([]), dots = useRef([]);
  const [on, setOn] = useState(() => LAYERS.map(() => reduceMotion));
  const [cur, setCur] = useState(reduceMotion ? 0 : -1);
  const onRef = useRef(on);
  const curRef = useRef(reduceMotion ? 0 : -1);

  // pin the section while the chip comes apart and goes back together
  useLayoutEffect(() => {
    const st = ScrollTrigger.create({
      trigger: sec.current,
      start: reduceMotion ? 'top 45%' : 'top top',
      end: () => reduceMotion ? 'bottom 55%' : '+=' + Math.round(window.innerHeight * (isMobile() ? 2.4 : 2.7)),
      pin: !reduceMotion,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });
    M.pinST = st;
    return () => { st.kill(); M.pinST = null; };
  }, []);

  useEffect(() => {
    const static_ = reduceMotion || document.documentElement.classList.contains('no-webgl');
    M.onFrame = ({ anchors, explode }) => {
      if (fill.current) fill.current.style.transform = `scaleX(${explode.toFixed(3)})`;
      const next = static_ ? LAYERS.map(() => true) : anchors.map((a) => a.t > 0.5);
      const prev = onRef.current;
      // phones show one callout at a time, stepped by scroll so each gets a moment
      let last = next.lastIndexOf(true);
      if (!static_ && isMobile() && M.pinST) last = Math.max(-1, Math.min(LAYERS.length - 1, Math.floor((M.pinST.progress - 0.26) / 0.085)));
      if (next.some((v, i) => v !== prev[i]) || last !== curRef.current) {
        onRef.current = next; setOn(next);
        curRef.current = last; setCur(last);
      }
      // leader lines from each layer's edge to its callout (desktop)
      if (!svg.current || isMobile()) return;
      const box = svg.current.getBoundingClientRect();
      if (box.bottom < 0 || box.top > window.innerHeight) return;
      anchors.forEach((a, i) => {
        const li = items.current[i], p = paths.current[i], d = dots.current[i];
        if (!li || !p) return;
        const r = li.getBoundingClientRect();
        const ax = a.x - box.left, ay = a.y - box.top, cx = r.left - box.left - 14, cy = r.top - box.top + 10;
        const mx = Math.max(ax + 30, cx - 70);
        p.setAttribute('d', `M${ax.toFixed(1)} ${ay.toFixed(1)} C${mx.toFixed(1)} ${ay.toFixed(1)} ${(cx - 50).toFixed(1)} ${cy.toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`);
        d.setAttribute('cx', ax.toFixed(1)); d.setAttribute('cy', ay.toFixed(1));
      });
    };
    return () => { M.onFrame = null; };
  }, []);

  return (
    <section className={'inside' + (reduceMotion ? ' static' : '')} id="skills" ref={sec} aria-labelledby="in-h">
      <div className="wrap inside-head">
        <SplitText tag="h2" text={plain(t('in.h2'))} className="d2" splitType="lines" mask effect="rise" textAlign="left" duration={1} delay={80} />
        <span id="in-h" hidden>{plain(t('in.h2'))}</span>
        <p {...html(t('in.p'))} />
      </div>
      <svg className="leaders" ref={svg} aria-hidden="true">
        {LAYERS.map((L, i) => (
          <g key={L.part} className={on[i] ? 'on' : ''}>
            <path ref={(el) => { paths.current[i] = el; }} />
            <circle ref={(el) => { dots.current[i] = el; }} r="3.5" />
          </g>
        ))}
      </svg>
      <ol className="callouts" aria-label={t('in.aria')}>
        {LAYERS.map((L, i) => (
          <li key={L.part} ref={(el) => { items.current[i] = el; }} className={'callout' + (on[i] ? ' on' : '') + (cur === i ? ' cur' : '')}>
            <span className="c-layer">
              {on[i] && !reduceMotion
                ? <DecryptedText key={lang + i} text={plain(t(L.layer))} animateOn="view" speed={45} maxIterations={14} sequential revealDirection="start" characters="01ABCDEF#%&*+=" encryptedClassName="c-enc" />
                : plain(t(L.layer))}
            </span>
            <h3 className="c-group" {...html(L.group ? t(L.group) : 'Amr Alkhatib')} />
            <p className="c-items" {...html(t(L.items))} />
          </li>
        ))}
      </ol>
      <div className="steps" aria-hidden="true">
        {LAYERS.map((L, i) => <i key={L.part} className={i === cur ? 'cur' : on[i] ? 'on' : ''} />)}
      </div>
      <div className="scrub" aria-hidden="true">
        <span>{t('in.assembled')}</span>
        <span className="track"><i ref={fill} /></span>
        <span className="hi">{t('in.exploded')}</span>
      </div>
    </section>
  );
}
