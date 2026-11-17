import { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { useLang } from './i18n.jsx';
import { getConsent, setConsent, CONSENT_KEY } from './consent.js';

// Vercel Web Analytics and Speed Insights only load after the visitor allows them.
// Withdrawing reloads the page, which is the only way to unload scripts that already ran.
export default function Consent() {
  const { t, lang } = useLang();
  const [choice, setChoice] = useState(getConsent);
  const [open, setOpen] = useState(() => getConsent() === null);
  const bar = useRef(null);
  const loaded = useRef(choice === 'granted');

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onChange = (e) => {
      const v = e.detail ?? getConsent();
      if (v !== 'granted' && loaded.current) { location.reload(); return; }
      setChoice(v);
    };
    const onStorage = (e) => { if (e.key === CONSENT_KEY) onChange({ detail: getConsent() }); };
    window.addEventListener('consent-open', onOpen);
    window.addEventListener('consent-change', onChange);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('consent-open', onOpen);
      window.removeEventListener('consent-change', onChange);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
  useEffect(() => { if (choice === 'granted') loaded.current = true; }, [choice]);
  // When reopened from the footer, move focus into the bar so keyboard users land on it.
  useEffect(() => { if (open && choice !== null) bar.current?.querySelector('button')?.focus(); }, [open]);

  const decide = (v) => { setOpen(false); setConsent(v); };

  return (
    <>
      {choice === 'granted' && <><Analytics /><SpeedInsights /></>}
      {open && (
        <section className="consent" ref={bar} role="region" aria-labelledby="consent-h">
          <h2 id="consent-h" className="consent-h">{t('cc.title')}</h2>
          <p className="consent-p">{t('cc.text')} <a href={(lang === 'de' ? '/privacy?lang=de' : '/privacy') + '#analytics'}>{t('cc.more')}</a></p>
          <div className="consent-btns">
            <button type="button" className="btn btn-ghost small" aria-pressed={choice === 'granted'} onClick={() => decide('granted')}>{t('cc.allow')}</button>
            <button type="button" className="btn btn-ghost small" aria-pressed={choice === 'denied'} onClick={() => decide('denied')}>{t('cc.deny')}</button>
          </div>
        </section>
      )}
    </>
  );
}
