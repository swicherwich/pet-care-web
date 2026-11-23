import { useEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Nav } from './components/Shell';
import Export from './screens/Export';
import More from './screens/More';
import Notifications from './screens/Notifications';
import Profile from './screens/Profile';
import Schedule from './screens/Schedule';
import Sharing from './screens/Sharing';
import Tips from './screens/Tips';
import Today from './screens/Today';
import { StoreProvider } from './state/store';
import { ToastProvider } from './state/toast';

const titles: Record<string, string> = {
  '/': 'Сьогодні',
  '/schedule': 'Розклад',
  '/pets': 'Рекс',
  '/more': 'Ще',
  '/tips': 'Поради та відео',
  '/notifications': 'Сповіщення',
  '/sharing': 'Спільний доступ',
  '/export': 'Експорт для ветеринара',
};

/** Назва сторінки, прокрутка нагору та фокус на заголовку після переходу (WCAG 2.4.2, 2.4.3) */
function RouteEffects() {
  const { pathname } = useLocation();
  const first = useRef(true);
  useEffect(() => {
    document.title = `${titles[pathname] ?? 'Pet Care'} · Pet Care`;
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo(0, 0);
    document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

function Shell() {
  return (
    <div className="app">
      <a className="skip-link" href="#main" onClick={(e) => { e.preventDefault(); const m = document.getElementById('main'); m?.setAttribute('tabindex', '-1'); m?.focus(); }}>
        Перейти до основного вмісту
      </a>
      <div className="app__main">
        <RouteEffects />
        <Routes>
          <Route path="/" element={<Today />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/pets" element={<Profile />} />
          <Route path="/more" element={<More />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/sharing" element={<Sharing />} />
          <Route path="/export" element={<Export />} />
          <Route path="*" element={<Today />} />
        </Routes>
      </div>
      <Nav />
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <StoreProvider>
          <Shell />
        </StoreProvider>
      </ToastProvider>
    </HashRouter>
  );
}
