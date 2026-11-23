import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/motion.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Режим кадру для порівняння з макетом: ?frame=device (статус-бар iOS, без анімацій)
const params = new URLSearchParams(window.location.search);
if (params.get('frame') === 'device') document.documentElement.dataset.frame = 'device';
if (params.get('theme') === 'dark') document.documentElement.dataset.theme = 'dark';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => undefined);
  });
}
