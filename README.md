# amralkhatib.de

My personal site: projects, models and experience, in English and German.

**Live:** https://amralkhatib.de

## What's on it

- **A chip that comes apart.** A processor package drawn live in 3D, built entirely in code with my name on the lid. Scrolling takes it apart layer by layer, and each layer is one group of my skills.
- **Interactive quintic explorer.** Drag the coefficients of x⁵ + ax³ + bx² + cx + d and watch the real roots move. It's based on my 2022 paper for the Kolmogorov Readings at Moscow State University.
- **Live product previews.** Small working recreations of each project's main screen (Visually, Wanderly, TruckOps, PitchRoom) instead of static screenshots.
- **Things I've modelled.** A timeline of systems I've turned into models or software, from aircraft boarding and urban parking to cache hierarchies and food-truck fleets.

## How it's built

- React and Vite. The 3D code loads after the page text, and phones get a lighter version of the chip. One fixed three.js canvas sits behind the page; the chip's geometry, brushed-metal and silicon materials, and the photo-studio lighting are all generated in code, with no 3D model or video files.
- The scroll is the camera script: GSAP (ScrollTrigger, SplitText) and Lenis smooth scrolling drive the camera shots, the exploded view and the callouts from one clock.
- Text and card effects from [React Bits](https://reactbits.dev): SplitText, DecryptedText, Magnet, SpotlightCard and the DotGrid background.
- English/German switch and light/dark theme, both remembered per visitor. With reduced motion the chip stays still and the skills become a plain list; without WebGL the content still works.
- Security headers set in `vercel.json`: a strict Content-Security-Policy (scripts only from the site itself plus one inline script allowed by SHA-256 hash), plus frame, referrer and permissions policies. Fonts are self-hosted.
- Contact form that delivers straight to my inbox (Web3Forms).
- Responsive down to phone width, with a dedicated menu panel for phones and tablets.
- Sitemap, `robots.txt` and Open Graph image for search and link previews.
- Deployed on Vercel, with Web Analytics and Speed Insights.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

If you change the inline script in `index.html`, update its SHA-256 hash in the Content-Security-Policy in `vercel.json`.
