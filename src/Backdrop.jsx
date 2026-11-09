import DotGrid from './bits/DotGrid.jsx';
import { useTheme } from './theme.jsx';

// Behind everything: soft studio light and a grid of contact pads (React Bits DotGrid).
// The pads glow gold around the cursor, like the gold pads on the chip.
export default function Backdrop() {
  const { theme } = useTheme();
  const L = theme === 'light';
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-light" />
      <DotGrid
        dotSize={2.4} gap={30} baseColor={L ? '#C2C9DD' : '#2B3561'} activeColor={L ? '#C88A16' : '#E7B85A'}
        proximity={190} strength={0.8} swell={0.7} stretch={0.25} glow={0.5}
        shockRadius={260} shockStrength={2.5} returnDuration={1.1} fade={0.1} opacity={1}
      />
    </div>
  );
}
