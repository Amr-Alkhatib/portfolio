import { useEffect, useRef } from 'react';
import { useLang, html, plain } from '../i18n.jsx';
import SplitText from '../bits/SplitText.jsx';
import Magnet from '../bits/Magnet.jsx';
import { gsap, reduceMotion } from '../motion.js';

export default function Hero() {
  const { t } = useLang();
  const rest = useRef(null);
  useEffect(() => {
    if (reduceMotion) return;
    const els = rest.current.querySelectorAll('[data-in]');
    const tw = gsap.fromTo(els, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.09, delay: 0.55 });
    return () => tw.kill();
  }, []);
  return (
    <section className="hero" id="top" aria-labelledby="hero-h">
      <div className="wrap hero-row" ref={rest}>
        <div className="intro">
          <p className="hello" data-in {...html(t('hero.hello'))} />
          <SplitText
            tag="h1" text={plain(t('hero.h1'))} className="d1 hero-h" splitType="lines" mask effect="rise"
            delay={90} duration={1.1} ease="power4.out" textAlign="left" trigger="view" threshold={0} rootMargin="0px"
          />
          <span id="hero-h" hidden>{plain(t('hero.h1'))}</span>
          <p className="lede" data-in {...html(t('hero.lede'))} />
          <div className="actions" data-in>
            <Magnet padding={70} magnetStrength={5}><a className="btn btn-primary" href="#work">{t('hero.cta1')}</a></Magnet>
            <a className="btn btn-ghost" href="#contact">{t('hero.cta2')}</a>
          </div>
          <p className="facts" data-in {...html(t('hero.facts'))} />
        </div>
      </div>
      <a className="hero-cue" href="#skills"><span className="cue-line" aria-hidden="true" />{t('hero.cue')}</a>
    </section>
  );
}
