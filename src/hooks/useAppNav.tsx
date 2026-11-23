import { useCallback, type MouseEvent } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate, type LinkProps } from 'react-router-dom';

export type NavKind = 'push' | 'back' | 'tab';

type VTDocument = Document & { startViewTransition?: (cb: () => void) => unknown };

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Навігація з переходом між екранами (сценарій S5). Без підтримки API або при reduced motion перехід миттєвий. */
export function useAppNav() {
  const navigate = useNavigate();

  const run = useCallback((action: () => void, kind: NavKind) => {
    const doc = document as VTDocument;
    const root = document.documentElement;
    if (!doc.startViewTransition || prefersReducedMotion() || root.dataset.frame) {
      action();
      return;
    }
    root.dataset.nav = kind;
    doc.startViewTransition(() => {
      flushSync(action);
    });
  }, []);

  const go = useCallback(
    (to: string, kind: NavKind = 'push', state?: unknown) => run(() => navigate(to, { state }), kind),
    [run, navigate],
  );

  /** Назад по історії; якщо історії немає (прямий вхід за посиланням), іде на запасний маршрут */
  const back = useCallback(
    (fallback: string) => {
      const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
      if (idx > 0) run(() => navigate(-1), 'back');
      else run(() => navigate(fallback, { replace: true }), 'back');
    },
    [run, navigate],
  );

  return { go, back };
}

interface AppLinkProps extends LinkProps {
  kind?: NavKind;
}

export function AppLink({ to, kind = 'push', onClick, state, ...rest }: AppLinkProps) {
  const { go } = useAppNav();
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    go(typeof to === 'string' ? to : String(to), kind, state);
  };
  return <Link to={to} state={state} onClick={handle} {...rest} />;
}
