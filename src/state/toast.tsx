import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  text: string;
  action?: ToastAction;
  leaving?: boolean;
}

interface ToastOptions {
  text: string;
  action?: ToastAction;
  /** Якщо true, тост не зникає сам і потребує закриття (WCAG 2.2.1) */
  persistent?: boolean;
}

interface ToastApi {
  show: (o: ToastOptions) => void;
  dismiss: () => void;
}

const Ctx = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastItem | null>(null);
  const timer = useRef<number | undefined>(undefined);
  const seq = useRef(0);

  const dismiss = useCallback(() => {
    window.clearTimeout(timer.current);
    setToast((t) => (t ? { ...t, leaving: true } : t));
    window.setTimeout(() => setToast((t) => (t?.leaving ? null : t)), 200);
  }, []);

  const show = useCallback(
    ({ text, action, persistent }: ToastOptions) => {
      window.clearTimeout(timer.current);
      seq.current += 1;
      setToast({ id: seq.current, text, action });
      if (!persistent) timer.current = window.setTimeout(dismiss, 8000);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="toast-region">
        {/* Область живого оновлення існує завжди, тому скрінрідер озвучує новий текст */}
        <div role="status" aria-live="polite" className="visually-hidden">
          {toast && !toast.leaving ? toast.text : ''}
        </div>
        {toast && (
          <div className="toast" key={toast.id} data-leaving={toast.leaving ? 'true' : undefined}>
            <span className="toast__text" aria-hidden="true">
              {toast.text}
            </span>
            {toast.action && (
              <button
                type="button"
                className="toast__btn"
                onClick={() => {
                  toast.action!.onClick();
                  dismiss();
                }}
              >
                {toast.action.label}
              </button>
            )}
            <button type="button" className="toast__btn" onClick={dismiss}>
              Закрити
            </button>
          </div>
        )}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useToast потрібно викликати всередині ToastProvider');
  return v;
}
