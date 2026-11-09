import { useEffect } from 'react';
import { LangProvider, useLang } from './i18n.jsx';
import { startScroll, scrollToHash, gsap, ScrollTrigger, reduceMotion } from './motion.js';
import Stage from './Stage.jsx';
import Header from './sections/Header.jsx';
import Hero from './sections/Hero.jsx';
import Inside from './sections/Inside.jsx';
import Work from './sections/Work.jsx';
import Models from './sections/Models.jsx';
import Experience from './sections/Experience.jsx';
import Contact from './sections/Contact.jsx';
import Backdrop from './Backdrop.jsx';
import { ThemeProvider } from './theme.jsx';

function Footer() {
  const { t } = useLang();
  return (
    <footer className="site-foot">
      <div className="wrap foot-row">
        <span>© 2026 Amr Alkhatib</span>
        <span className="made">{t('foot.made')}</span>
        <span className="foot-links">
          <a href="#work">{t('nav.work')}</a><a href="#models">{t('nav.models')}</a><a href="#experience">{t('nav.exp')}</a><a href="#top">{t('foot.top')}</a>
        </span>
      </div>
    </footer>
  );
}

function Shell() {
  const { lang, t } = useLang();
  useEffect(() => {
    const stop = startScroll();
    // in-page links go through Lenis so they glide instead of jumping
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const h = a.getAttribute('href');
      if (h.length < 2) return;
      e.preventDefault();
      scrollToHash(h);
      try { if (h !== '#top') history.replaceState(null, '', h); } catch (err) { /* sandboxed */ }
    };
    document.addEventListener('click', onClick);
    // quiet reveals for cards and rows, driven by scroll position
    let batch = [];
    if (!reduceMotion) {
      batch = ScrollTrigger.batch('.reveal', {
        start: 'top 90%',
        onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08, overwrite: true }),
      });
    }
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => { stop(); document.removeEventListener('click', onClick); window.removeEventListener('load', refresh); batch.forEach((b) => b.kill()); };
  }, []);
  // text length changes with the language, so re-measure the pinned section
  useEffect(() => { const id = setTimeout(() => ScrollTrigger.refresh(), 60); return () => clearTimeout(id); }, [lang]);
  return (
    <div className="page">
      <a className="skip" href="#work">{t('skip')}</a>
      <Backdrop />
      <Stage />
      <Header />
      <main>
        <Hero />
        <Inside />
        <Work />
        <Models />
        <Experience />
      </main>
      <Contact />
      <Footer />
    </div>
  );
}

export default function App() {
  return <ThemeProvider><LangProvider><Shell /></LangProvider></ThemeProvider>;
}
