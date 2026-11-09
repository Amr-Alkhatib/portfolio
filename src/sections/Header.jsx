import { useEffect, useRef, useState } from 'react';
import { useLang } from '../i18n.jsx';
import { useTheme } from '../theme.jsx';

const LINKS = [['#work', 'nav.work'], ['#skills', 'nav.skills'], ['#models', 'nav.models'], ['#experience', 'nav.exp'], ['#contact', 'nav.contact']];

export const BrandMark = () => (
  <svg className="brand-mark" viewBox="0 0 26 26" aria-hidden="true">
    <rect x="5" y="5" width="16" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    <rect x="9.5" y="9.5" width="7" height="7" rx="1" fill="var(--gold)" />
    <path d="M9 2v3M13 2v3M17 2v3M9 21v3M13 21v3M17 21v3M2 9h3M2 13h3M2 17h3M21 9h3M21 13h3M21 17h3" stroke="var(--text-2)" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

function Lang({ big }) {
  const { lang, setLang, t } = useLang();
  const opts = big ? [['en', 'English'], ['de', 'Deutsch']] : [['en', 'EN'], ['de', 'DE']];
  return (
    <div className={big ? 'lang lang-lg' : 'lang head-lang'} role="group" aria-label={t('lang.aria')}>
      {opts.map(([k, l]) => (
        <button key={k} type="button" lang={k} aria-pressed={lang === k} onClick={() => setLang(k)} title={big ? undefined : k === 'en' ? 'English' : 'Deutsch'}>{l}</button>
      ))}
    </div>
  );
}

const Moon = () => <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>;
const Sun = () => <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>;

function ThemeButton() {
  const { t } = useLang();
  const { theme, setTheme } = useTheme();
  const label = t(theme === 'dark' ? 'toLight' : 'toDark');
  return (
    <button className="theme-btn" type="button" aria-label={label} title={label} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </button>
  );
}

function ThemeSwitch() {
  const { t } = useLang();
  const { theme, setTheme } = useTheme();
  return (
    <div className="lang lang-lg" role="group" aria-label={t('menu.theme')}>
      {['light', 'dark'].map((k) => <button key={k} type="button" aria-pressed={theme === k} onClick={() => setTheme(k)}>{t('theme.' + k)}</button>)}
    </div>
  );
}

export default function Header() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState('');
  const prog = useRef(null), panel = useRef(null), btn = useRef(null), closeBtn = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
      if (prog.current) prog.current.style.transform = `scaleX(${p.toFixed(4)})`;
      setScrolled(h.scrollTop > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const spy = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) setCurrent('#' + e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
    LINKS.forEach(([h]) => { const el = document.querySelector(h); if (el) spy.observe(el); });
    return () => { window.removeEventListener('scroll', onScroll); spy.disconnect(); };
  }, []);

  // menu panel: focus moves in, Tab stays inside, Escape or a link closes it
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    if (!open) return;
    const back = document.activeElement;
    closeBtn.current?.focus({ preventScroll: true });
    const onKey = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false); btn.current?.focus({ preventScroll: true }); return; }
      if (e.key === 'Tab') {
        const f = [...panel.current.querySelectorAll('a[href],button')], first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    const wide = window.matchMedia('(min-width: 900px)');
    const onWide = (e) => { if (e.matches) setOpen(false); };
    document.addEventListener('keydown', onKey);
    wide.addEventListener('change', onWide);
    return () => { document.removeEventListener('keydown', onKey); wide.removeEventListener('change', onWide); if (back?.focus && back !== document.body) back.focus({ preventScroll: true }); };
  }, [open]);

  const arrow = <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
  return (
    <>
      <header className={'site-head' + (scrolled ? ' scrolled' : '')}>
        <div className="wrap head-row">
          <a className="brand" href="#top"><BrandMark /><span>Amr Alkhatib</span></a>
          <div className="head-right">
            <nav className="nav" aria-label={t('nav.aria')}>
              {LINKS.map(([h, k]) => <a key={h} href={h} aria-current={current === h ? 'true' : undefined}>{t(k)}</a>)}
            </nav>
            <Lang />
            <ThemeButton />
            <button ref={btn} className="menu-btn" type="button" aria-expanded={open} aria-controls="menuPanel" aria-label={t('menu.btn')} onClick={() => setOpen(true)}>
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg>
            </button>
          </div>
        </div>
        <div className="progress" ref={prog} />
      </header>
      <div className={'menu-scrim' + (open ? ' open' : '')} onClick={() => setOpen(false)} />
      <aside ref={panel} id="menuPanel" className={'menu-panel' + (open ? ' open' : '')} role="dialog" aria-modal="true" aria-label={t('menu.btn')} inert={!open}>
        <div className="menu-top">
          <span className="menu-title">{t('menu.title')}</span>
          <button ref={closeBtn} className="icon-btn" type="button" aria-label={t('menu.close')} onClick={() => setOpen(false)}>
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
        <nav className="menu-nav" aria-label={t('nav.aria')}>
          {LINKS.map(([h, k]) => <a key={h} href={h} onClick={() => setOpen(false)}><span>{t(k)}</span>{arrow}</a>)}
        </nav>
        <div className="menu-group">
          <span className="menu-label">{t('menu.lang')}</span>
          <Lang big />
        </div>
        <div className="menu-group">
          <span className="menu-label">{t('menu.theme')}</span>
          <ThemeSwitch />
        </div>
        <p className="menu-mail">amr.alkhatib@tum.de</p>
      </aside>
    </>
  );
}
