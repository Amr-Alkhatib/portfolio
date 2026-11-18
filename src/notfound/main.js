// 404 page: language switch and the requested path. No analytics are loaded here.
import '../styles.css';
import '../privacy/privacy.css';
import './notfound.css';

const root = document.documentElement;
const TITLE = { en: 'Page not found – Amr Alkhatib', de: 'Seite nicht gefunden – Amr Alkhatib' };

function render() {
  const l = root.dataset.lang === 'de' ? 'de' : 'en';
  document.title = TITLE[l];
  document.querySelectorAll('[data-set-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.setLang === l)));
}

function setLang(l) {
  root.dataset.lang = l;
  root.lang = l;
  try { localStorage.setItem('lang', l); } catch (e) { /* private mode */ }
  render();
}

// Show which address was asked for, as plain text.
const path = document.querySelector('[data-path]');
if (path && location.pathname !== '/404' && location.pathname !== '/404.html') {
  let p = location.pathname;
  try { p = decodeURI(p); } catch (e) { /* keep it encoded */ }
  path.textContent = p;
  path.title = p;
  path.closest('.nf-path').hidden = false;
}

document.querySelectorAll('[data-set-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.setLang)));
window.addEventListener('storage', (e) => { if (e.key === 'lang' && (e.newValue === 'en' || e.newValue === 'de')) { root.dataset.lang = e.newValue; root.lang = e.newValue; render(); } });
if (!root.dataset.lang) root.dataset.lang = 'en';
render();
