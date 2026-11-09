import { lazy, Suspense, useState } from 'react';
import { useTheme } from './theme.jsx';

// The interactive pad grid only loads where there is a mouse to play with it.
// Phones get the same pattern drawn by CSS, which costs nothing while scrolling.
const DotGrid = lazy(() => import('./bits/DotGrid.jsx'));

export default function Backdrop() {
  const { theme } = useTheme();
  const L = theme === 'light';
  const [live] = useState(() => window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)').matches);
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-light" />
      {live ? (
        <Suspense fallback={<div className="dots-static" />}>
          <DotGrid
            dotSize={2.4} gap={30} baseColor={L ? '#B9C1D4' : '#2B3561'} activeColor={L ? '#B57E14' : '#E7B85A'}
            proximity={190} strength={0.8} swell={0.7} stretch={0.25} glow={0.5}
            shockRadius={260} shockStrength={2.5} returnDuration={1.1} fade={0.1} opacity={1}
          />
        </Suspense>
      ) : <div className="dots-static" />}
    </div>
  );
}
