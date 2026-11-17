import { createRoot } from 'react-dom/client';
import './styles.css';
import App from './App.jsx';

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) document.documentElement.classList.add('motion');
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
createRoot(document.getElementById('root')).render(<App />);
