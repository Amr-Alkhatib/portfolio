// Visitor's choice about Vercel Web Analytics and Speed Insights.
// Stored in localStorage as 'granted' or 'denied'; nothing loads until 'granted'.
// The privacy page (src/privacy/main.js) reads and writes the same key.
export const CONSENT_KEY = 'analytics-consent';

export function getConsent() {
  try { const v = localStorage.getItem(CONSENT_KEY); return v === 'granted' || v === 'denied' ? v : null; } catch (e) { return null; }
}

export function setConsent(v) {
  try { localStorage.setItem(CONSENT_KEY, v); } catch (e) { /* private mode: the choice lasts for this page view */ }
  window.dispatchEvent(new CustomEvent('consent-change', { detail: v }));
}

// Reopens the consent bar (footer button).
export const openConsent = () => window.dispatchEvent(new Event('consent-open'));
