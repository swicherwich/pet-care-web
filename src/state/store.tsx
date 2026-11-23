import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react';
import { initialEvents, type CareEvent, type PetId } from '../data/mock';

const nowHHMM = () => new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', hour12: false });

export interface NewEventInput {
  title: string;
  petId: PetId;
  time: string;
}

interface Store {
  events: CareEvent[];
  /** Чи користувач уже змінював стан подій (після цього заголовок показує прогрес, S8) */
  touched: boolean;
  toggleEvent: (id: string) => CareEvent | undefined;
  addEvent: (e: NewEventInput) => string;
  /** Налаштування, що живуть між екранами */
  notify: Record<string, boolean>;
  setNotify: (key: string, value: boolean) => void;
  showDoer: boolean;
  setShowDoer: (v: boolean) => void;
  invited: boolean;
  setInvited: (v: boolean) => void;
  alertAnswer: null | 'have' | 'buy';
  setAlertAnswer: (v: null | 'have' | 'buy') => void;
}

const Ctx = createContext<Store | null>(null);

const defaultNotify: Record<string, boolean> = {
  week: true,
  dayBefore: true,
  dayOf: true,
  digest: true,
  quiet: true,
  push: true,
  mail: false,
};

export function StoreProvider({ children, initialInvited = false }: { children: ReactNode; initialInvited?: boolean }) {
  const [events, setEventsState] = useState<CareEvent[]>(initialEvents);
  // Актуальний список події читаємо синхронно: дія «Скасувати» в тості викликається вже після оновлення стану
  const eventsRef = useRef(events);
  const setEvents = useCallback((next: CareEvent[] | ((l: CareEvent[]) => CareEvent[])) => {
    eventsRef.current = typeof next === 'function' ? next(eventsRef.current) : next;
    setEventsState(eventsRef.current);
  }, []);
  const [touched, setTouched] = useState(false);
  const [notify, setNotifyState] = useState(defaultNotify);
  const [showDoer, setShowDoer] = useState(true);
  const [invited, setInvited] = useState(initialInvited);
  const [alertAnswer, setAlertAnswer] = useState<null | 'have' | 'buy'>(null);

  const toggleEvent = useCallback(
    (id: string) => {
      const e = eventsRef.current.find((x) => x.id === id);
      if (!e) return undefined;
      const changed: CareEvent =
        e.status === 'done'
          ? { ...e, status: e.group === 'overdue' ? 'overdue' : 'todo', doneBy: undefined, doneAt: undefined }
          : { ...e, status: 'done', doneBy: 'Олег', doneAt: nowHHMM() };
      setEvents((list) => list.map((x) => (x.id === id ? changed : x)));
      setTouched(true);
      return changed;
    },
    [setEvents],
  );

  const addEvent = useCallback(
    (input: NewEventInput) => {
      const id = `new-${Date.now()}`;
      setEvents((list) => [
        ...list,
        { id, title: input.title, petId: input.petId, group: 'today', status: 'todo', when: input.time, isNew: true },
      ]);
      setTouched(true);
      // Підсвітка нового рядка (S7) тримається недовго, потім знімається
      window.setTimeout(() => setEvents((list) => list.map((x) => (x.id === id ? { ...x, isNew: false } : x))), 2200);
      return id;
    },
    [setEvents],
  );

  const setNotify = useCallback((key: string, value: boolean) => setNotifyState((s) => ({ ...s, [key]: value })), []);

  const value = useMemo<Store>(
    () => ({
      events,
      touched,
      toggleEvent,
      addEvent,
      notify,
      setNotify,
      showDoer,
      setShowDoer,
      invited,
      setInvited,
      alertAnswer,
      setAlertAnswer,
    }),
    [events, touched, toggleEvent, addEvent, notify, setNotify, showDoer, invited, alertAnswer],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore потрібно викликати всередині StoreProvider');
  return v;
}
