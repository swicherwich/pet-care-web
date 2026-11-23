import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AppLink } from '../hooks/useAppNav';
import { TabCalendarIcon, TabMoreActiveIcon, TabMoreIcon, TabPawActiveIcon, TabPawIcon, TabTodayActiveIcon, TabTodayIcon } from './icons';

interface Tab {
  to: string;
  label: string;
  match: (p: string) => boolean;
  icon: ReactNode;
  iconActive: ReactNode;
}

const tabs: Tab[] = [
  { to: '/', label: 'Сьогодні', match: (p) => p === '/', icon: <TabTodayIcon />, iconActive: <TabTodayActiveIcon /> },
  { to: '/schedule', label: 'Розклад', match: (p) => p === '/schedule', icon: <TabCalendarIcon />, iconActive: <TabCalendarIcon /> },
  { to: '/pets', label: 'Улюбленці', match: (p) => p.startsWith('/pets'), icon: <TabPawIcon />, iconActive: <TabPawActiveIcon /> },
  {
    to: '/more',
    label: 'Ще',
    match: (p) => ['/more', '/tips', '/notifications', '/sharing', '/export'].includes(p),
    icon: <TabMoreIcon />,
    iconActive: <TabMoreActiveIcon />,
  },
];

export function Nav() {
  const { pathname } = useLocation();
  return (
    <nav className="nav" aria-label="Основна навігація">
      {tabs.map((t) => {
        const active = t.match(pathname);
        const exact = pathname === t.to;
        return (
          <AppLink key={t.to} to={t.to} kind="tab" className="nav__item" aria-current={active ? (exact ? 'page' : 'true') : undefined}>
            <span className="nav__pill" aria-hidden="true">
              {active ? t.iconActive : t.icon}
            </span>
            <span>{t.label}</span>
          </AppLink>
        );
      })}
      <span className="home-indicator" aria-hidden="true" />
    </nav>
  );
}

/** Каркас екрана: статус-бар (лише в режимі кадру), основний вміст */
export function Screen({ children, className = '', busy = false }: { children: ReactNode; className?: string; busy?: boolean }) {
  return (
    <div className="screen">
      <div className="statusbar" aria-hidden="true">
        <span className="statusbar__time">9:41</span>
        <span className="statusbar__icons">
          <i />
          <i />
          <i />
        </span>
      </div>
      <main id="main" className={`content ${className}`} aria-busy={busy || undefined}>
        {children}
      </main>
    </div>
  );
}
