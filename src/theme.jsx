import { createContext, useContext, useEffect, useState } from 'react';
import { M } from './motion.js';

// Light or dark: follows the system until the visitor picks one, then remembers it.
const Ctx = createContext({ theme: 'dark', setTheme: () => {} });
const light = () => window.matchMedia('(prefers-color-scheme: light)');
const stored = () => { try { const t = localStorage.getItem('theme'); return t === 'light' || t === 'dark' ? t : null; } catch (e) { return null; } };

export function ThemeProvider({ children }) {
  const [choice, setChoice] = useState(stored);
  const [system, setSystem] = useState(() => (light().matches ? 'light' : 'dark'));
  useEffect(() => {
    const m = light(), on = (e) => setSystem(e.matches ? 'light' : 'dark');
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, []);
  const theme = choice || system;
  useEffect(() => {
    const root = document.documentElement;
    if (choice) root.dataset.theme = choice; else delete root.dataset.theme;
    M.theme = theme;
    M.engine?.setTheme(theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#F2F4F9' : '#080B16');
  }, [choice, theme]);
  const setTheme = (t) => { setChoice(t); try { localStorage.setItem('theme', t); } catch (e) { /* private mode */ } };
  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>;
}

export const useTheme = () => useContext(Ctx);
