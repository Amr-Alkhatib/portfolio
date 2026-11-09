import { useEffect, useRef, useState } from 'react';
import { useLang, html, plain } from '../i18n.jsx';
import SplitText from '../bits/SplitText.jsx';
import SpotlightCard from '../bits/SpotlightCard.jsx';
import Magnet from '../bits/Magnet.jsx';

// Web3Forms emails each message to amr.alkhatib@tum.de. The key is public by design.
const ACCESS_KEY = '18e4d6d7-91b5-4492-8a1d-b0b0e56ccf71';
const KEYS = ['name', 'email', 'message'];
const OK = { name: (v) => v.trim().length > 0, email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()), message: (v) => v.trim().length > 0 };
const ERR = { name: 'errName', email: 'errEmail', message: 'errMsg' };

function Form() {
  const { t, lang } = useLang();
  const [vals, setVals] = useState({ name: '', email: '', message: '' });
  const [bad, setBad] = useState({});
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [sent, setSent] = useState(null);
  const refs = { name: useRef(null), email: useRef(null), message: useRef(null) }, doneRef = useRef(null), honey = useRef(null);
  const check = (k, v = vals[k]) => { const good = OK[k](v); setBad((b) => ({ ...b, [k]: !good })); return good; };
  const change = (k) => (e) => { const v = e.target.value; setVals((s) => ({ ...s, [k]: v })); if (bad[k]) check(k, v); };
  const blur = (k) => () => { if (tried || vals[k].trim()) check(k); };
  useEffect(() => { if (sent) doneRef.current?.focus(); }, [sent]);

  const submit = async (e) => {
    e.preventDefault(); setTried(true); setStatus('');
    const results = KEYS.map((k) => check(k));
    if (results.includes(false)) { refs[KEYS[results.indexOf(false)]].current.focus(); return; }
    if (honey.current?.checked) return;
    const data = { access_key: ACCESS_KEY, subject: 'Portfolio message from ' + vals.name.trim(), from_name: 'Portfolio contact form', name: vals.name.trim(), email: vals.email.trim(), message: vals.message.trim(), language: lang === 'de' ? 'German' : 'English' };
    setBusy(true);
    try {
      const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 15000);
      const r = await fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data), signal: ctrl.signal });
      clearTimeout(timer);
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.success) throw new Error(j.message || 'HTTP ' + r.status);
      setSent({ name: data.name, email: data.email }); setVals({ name: '', email: '', message: '' }); setTried(false); setBad({});
    } catch (err) { setStatus('errSend'); } finally { setBusy(false); }
  };

  if (sent) return (
    <div className="form-done">
      <span className="done-mark" aria-hidden="true"><svg className="ico" viewBox="0 0 24 24"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg></span>
      <h3 ref={doneRef} tabIndex={-1}>{t('doneTitle')}</h3>
      <p>{t('doneText', sent.name, sent.email)}</p>
      <button className="btn btn-ghost" type="button" onClick={() => { setSent(null); setTimeout(() => refs.name.current?.focus(), 0); }}>{t('f.again')}</button>
    </div>
  );
  const field = (k, type, ac, extra = {}) => (
    <div className="field">
      <label htmlFor={'f-' + k}>{t(k === 'message' ? 'f.msg' : 'f.' + k)}</label>
      {k === 'message'
        ? <textarea id={'f-' + k} ref={refs[k]} rows={5} maxLength={5000} value={vals[k]} onChange={change(k)} onBlur={blur(k)} placeholder={t('f.msgPh')} aria-invalid={bad[k] ? 'true' : undefined} aria-describedby={'e-' + k} />
        : <input id={'f-' + k} ref={refs[k]} type={type} autoComplete={ac} maxLength={k === 'name' ? 100 : 200} value={vals[k]} onChange={change(k)} onBlur={blur(k)} placeholder={t(k === 'name' ? 'f.namePh' : 'f.emailPh')} aria-invalid={bad[k] ? 'true' : undefined} aria-describedby={'e-' + k} {...extra} />}
      <small className="err" id={'e-' + k}>{bad[k] ? t(ERR[k]) : ''}</small>
    </div>
  );
  return (
    <form className="cform" noValidate onSubmit={submit}>
      <div className="field-row">{field('name', 'text', 'name')}{field('email', 'email', 'email', { spellCheck: false })}</div>
      {field('message')}
      <input ref={honey} className="hp" type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <div className="form-foot">
        <Magnet padding={50} magnetStrength={6}>
          <button className="btn btn-primary" type="submit" disabled={busy}><span>{busy ? t('sending') : t('send')}</span><svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6" /></svg></button>
        </Magnet>
      </div>
      <p className="form-status" role="status" aria-live="polite">{status ? t(status) : ''}</p>
    </form>
  );
}

export default function Contact() {
  const { t, lang } = useLang();
  const [time, setTime] = useState('--:--');
  const [copied, setCopied] = useState('');
  const mail = useRef(null);
  useEffect(() => {
    const tf = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit' });
    const tick = () => setTime(tf.format(new Date())); tick();
    const id = setInterval(tick, 15000); return () => clearInterval(id);
  }, []);
  const copy = () => {
    const done = () => { setCopied('copied'); setTimeout(() => setCopied(''), 1800); };
    const fallback = () => { const s = getSelection(), r = document.createRange(); r.selectNodeContents(mail.current); s.removeAllRanges(); s.addRange(r); setCopied('selected'); setTimeout(() => setCopied(''), 2600); };
    try { navigator.clipboard.writeText('amr.alkhatib@tum.de').then(done, fallback); } catch (e) { fallback(); }
  };
  const local = t('c.local').replace(/<time[^>]*>.*?<\/time>/, '<time>' + time + '</time>');
  return (
    <section className="contact" id="contact" aria-labelledby="c-h">
      <div className="wrap contact-grid">
        <div className="contact-main">
          <SplitText tag="h2" text={plain(t('c.h2'))} className="d1 contact-h" splitType="lines" mask effect="rise" textAlign="left" duration={1.1} delay={90} />
          <span id="c-h" hidden>{plain(t('c.h2'))}</span>
          <p className="reveal" {...html(t('c.p'))} />
          <SpotlightCard className="form-card reveal" spotlightColor="rgba(231,184,90,0.9)" intensity={0.1} spotlightSize={360} borderGlow={0.7}>
            <Form key={lang} />
          </SpotlightCard>
        </div>
        <div className="contact-side">
          <div className="chip-slot" aria-hidden="true" />
          <div className="direct">
            <span className="mail-label">{t('c.direct')}</span>
            <a className="email" ref={mail} href="mailto:amr.alkhatib@tum.de">amr.alkhatib@tum.de</a>
            <button className="btn btn-ghost small" type="button" onClick={copy}>
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a1 1 0 0 1 1-1h9" /></svg>
              <span>{copied ? t(copied) : t('copy')}</span>
            </button>
          </div>
          <nav className="elsewhere" aria-label={t('c.profiles')}>
            {[['GitHub', 'github.com/Amr-Alkhatib', 'https://github.com/Amr-Alkhatib'], ['LinkedIn', 'linkedin.com/in/amralkhatib86', 'https://www.linkedin.com/in/amralkhatib86']].map(([n, s, h]) => (
              <a className="ext-row" key={n} href={h} target="_blank" rel="noopener"><span><b>{n}</b><small>{s}</small></span><svg className="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" /></svg></a>
            ))}
          </nav>
          <p className="local"><span className="pulse" aria-hidden="true" /><span {...html(local)} /></p>
        </div>
      </div>
    </section>
  );
}
