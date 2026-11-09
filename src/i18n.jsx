import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DICT, STR } from './strings.js';

const Ctx = createContext(null);

function initial() {
  let l = null;
  try { const q = new URLSearchParams(location.search).get('lang'); if (q === 'de' || q === 'en') l = q; } catch (e) { /* ignore */ }
  if (!l) { try { const s = localStorage.getItem('lang'); if (s === 'de' || s === 'en') l = s; } catch (e) { /* ignore */ } }
  return l || 'en';
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(initial);
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem('lang', l); } catch (e) { /* ignore */ }
  }, []);
  const t = useCallback((k, ...a) => {
    const d = DICT[lang][k] ?? DICT.en[k];
    if (d != null) return d;
    const s = STR[lang][k] ?? STR.en[k];
    return typeof s === 'function' ? s(...a) : (s ?? k);
  }, [lang]);
  const num = useCallback((v, n) => { const s = v.toFixed(n); return lang === 'de' ? s.replace('.', ',') : s; }, [lang]);
  const value = useMemo(() => ({ lang, setLang, t, num }), [lang, setLang, t, num]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

// strings may hold a little inline markup (math spans, &amp;)
export const html = (s) => ({ dangerouslySetInnerHTML: { __html: s } });
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&nbsp;': ' ' };
export const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/&[a-z#0-9]+;/gi, (m) => ENT[m] ?? m);
