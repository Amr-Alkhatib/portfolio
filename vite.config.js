import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// The privacy page shows a contact address for data protection requests.
// It comes from VITE_CONTACT_EMAIL (Vercel → Settings → Environment Variables,
// or a local .env file) and replaces every <!--contact-email--> in the HTML.
function privacyContact(email) {
  const ok = /^[^\s@<>"'&]+@[^\s@<>"'&]+\.[^\s@<>"'&]+$/.test(email);
  if (email && !ok) throw new Error(`VITE_CONTACT_EMAIL does not look like an email address: ${email}`);
  const html = ok
    ? `<a href="mailto:${email}">${email}</a>`
    : '<span class="legal-missing">[contact address not configured]</span>';
  return {
    name: 'privacy-contact',
    transformIndexHtml: (page) => page.replaceAll('<!--contact-email-->', html),
  };
}

export default defineConfig(({ mode }) => {
  const email = (loadEnv(mode, process.cwd(), 'VITE_').VITE_CONTACT_EMAIL || '').trim();
  // A production deploy must never ship a privacy policy without a contact address.
  if (!email && process.env.VERCEL_ENV === 'production') {
    throw new Error('VITE_CONTACT_EMAIL is not set. Add it in Vercel → Project → Settings → Environment Variables, then redeploy.');
  }
  return {
    plugins: [react(), privacyContact(email)],
    build: {
      target: 'es2020',
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        input: { main: resolve(__dirname, 'index.html'), privacy: resolve(__dirname, 'privacy.html') },
      },
    },
  };
});
