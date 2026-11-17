// Privacy page: language switch and the consent controls for visitor statistics.
// No analytics are ever loaded on this page.
import '../styles.css';
import './privacy.css';
import { CONSENT_KEY } from '../consent.js';

const root = document.documentElement;
const STATUS = {
  en: { granted: 'allowed', denied: 'not allowed', none: 'not decided yet' },
  de: { granted: 'erlaubt', denied: 'nicht erlaubt', none: 'noch nicht entschieden' },
};

const lang = () => (root.dataset.lang === 'de' ? 'de' : 'en');

function setLang(l) {
  root.dataset.lang = l;
  root.lang = l;
  try { localStorage.setItem('lang', l); } catch (e) { /* private mode */ }
  try { const u = new URL(location.href); if (u.searchParams.has('lang')) { u.searchParams.delete('lang'); history.replaceState(null, '', u); } } catch (e) { /* sandboxed */ }
  render();
}

function consent() {
  try { const v = localStorage.getItem(CONSENT_KEY); return v === 'granted' || v === 'denied' ? v : null; } catch (e) { return null; }
}

function render() {
  const l = lang(), c = consent();
  document.querySelectorAll('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === l)));
  document.querySelectorAll('article').forEach((a) => {
    const s = a.lang === 'de' ? STATUS.de : STATUS.en;
    a.querySelectorAll('[data-consent-status]').forEach((el) => { el.textContent = s[c ?? 'none']; });
    a.querySelectorAll('[data-consent]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.consent === c)));
  });
}

document.querySelectorAll('[data-set-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.setLang)));
document.querySelectorAll('[data-consent]').forEach((b) => b.addEventListener('click', () => {
  try { localStorage.setItem(CONSENT_KEY, b.dataset.consent); } catch (e) { /* private mode */ }
  render();
}));
window.addEventListener('storage', (e) => { if (e.key === CONSENT_KEY || e.key === 'lang') render(); });
if (!root.dataset.lang) root.dataset.lang = 'en';
render();
