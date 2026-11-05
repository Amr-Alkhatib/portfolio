# amralkhatib.de

My personal site: projects, models and experience, in English and German.

**Live:** https://amralkhatib.de

## What's on it

- **Interactive quintic explorer.** Drag the coefficients of x⁵ + ax³ + bx² + cx + d and watch the real roots move. It's based on my 2022 paper for the Kolmogorov Readings at Moscow State University.
- **Live product previews.** Small working recreations of each project's main screen (Visually, TruckOps, PitchRoom) instead of static screenshots.
- **Things I've modelled.** A timeline of systems I've turned into models or software, from aircraft boarding and urban parking to cache hierarchies and food-truck fleets.

## How it's built

- A single static `index.html` with hand-written HTML, CSS and JavaScript. No framework and no build step.
- English/German switch and light/dark theme, both remembered per visitor.
- Security headers set in `vercel.json`: a strict Content-Security-Policy that allows inline scripts only by SHA-256 hash, plus frame, referrer and permissions policies. Fonts are self-hosted, so the site makes no third-party font requests.
- Contact form that delivers straight to my inbox (Web3Forms).
- Responsive down to phone width, with a dedicated menu panel for phones and tablets.
- Sitemap, `robots.txt` and Open Graph image for search and link previews.
- Deployed on Vercel, with Web Analytics and Speed Insights.

## Run locally

No build step. Serve the folder with any static server:

```bash
python -m http.server 8000
# then open http://localhost:8000
```
