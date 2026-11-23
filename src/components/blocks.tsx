import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { ActivityIcon, AlertIcon, CheckIcon, ChevronRightIcon, ClockIcon, PlayLgIcon, PlaySmIcon, SearchIcon } from './icons';
import { Badge, Photo } from './ui';
import { eventMeta, type CareEvent } from '../data/mock';

/* ---------- Рядок події ---------- */
export function EventRow({
  event,
  onToggle,
  onOpen,
}: {
  event: CareEvent;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const id = useId();
  const done = event.status === 'done';
  return (
    <li className="event-row" data-status={event.status} data-new={event.isNew ? 'true' : undefined}>
      <button
        type="button"
        role="checkbox"
        aria-checked={done}
        aria-labelledby={`${id}-t`}
        aria-describedby={`${id}-m`}
        className="event-row__status"
        onClick={onToggle}
      >
        <span className="event-row__dot" aria-hidden="true">
          {event.status === 'overdue' ? <AlertIcon /> : <CheckIcon />}
        </span>
      </button>
      <button type="button" className="event-row__body" onClick={onOpen}>
        <span className="event-row__text">
          <span className="event-row__title" id={`${id}-t`}>
            {event.title}
          </span>
          <span className="event-row__meta" id={`${id}-m`}>
            {eventMeta(event)}
          </span>
        </span>
        <ChevronRightIcon className="event-row__chevron" aria-hidden="true" />
      </button>
    </li>
  );
}

/** Список рядків; розділювачі між ними малює CSS (`.card > li + li`) */
export function EventList({ children, label }: { children: ReactNode; label: string }) {
  return (
    <ul className="card" aria-label={label} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {children}
    </ul>
  );
}

/* ---------- Плитка показника ---------- */
export function StatTile({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="stat-tile">
      <div className="stat-tile__top">
        <span className="stat-tile__label">{label}</span>
        <ActivityIcon aria-hidden="true" />
      </div>
      <span className="stat-tile__value">{value}</span>
      <span className="stat-tile__delta">{delta}</span>
    </div>
  );
}

/* ---------- Картка-підказка ---------- */
export function AlertCard({ title, children, actions }: { title: string; children: ReactNode; actions: ReactNode }) {
  const id = useId();
  return (
    <section className="alert-card" aria-labelledby={id}>
      <h2 className="alert-card__title" id={id}>
        {title}
      </h2>
      <div className="alert-card__text">{children}</div>
      <div className="alert-card__actions">{actions}</div>
    </section>
  );
}

/* ---------- Медіа-картки (відео та статті) ---------- */
interface MediaProps {
  title: string;
  onOpen: () => void;
}

export function VideoRowCard({ title, meta, onOpen }: MediaProps & { meta: string }) {
  return (
    <button type="button" className="media-card media-card--row" onClick={onOpen}>
      <span className="video-thumb video-thumb--small" aria-hidden="true">
        <span className="video-thumb__scrim" />
        <span className="video-thumb__play">
          <PlaySmIcon />
        </span>
      </span>
      <span className="media-card__text">
        <span className="visually-hidden">Відео: </span>
        <span className="media-card__title">{title}</span>
        <span className="media-card__meta">{meta}</span>
      </span>
    </button>
  );
}

export function VideoWideCard({ title, meta, duration, onOpen }: MediaProps & { meta: string; duration: string }) {
  return (
    <button type="button" className="media-card media-card--col" onClick={onOpen}>
      <span className="video-thumb video-thumb--wide" aria-hidden="true">
        <span className="video-thumb__scrim" />
        <span className="video-thumb__play">
          <PlayLgIcon />
        </span>
        <span className="video-thumb__duration">{duration}</span>
      </span>
      <span className="media-card__text media-card__text--pad media-card__text--tight">
        <span className="visually-hidden">Відео: </span>
        <span className="media-card__title t-h3-inline">{title}</span>
        <span className="media-card__desc">{meta}</span>
      </span>
    </button>
  );
}

export function ArticlePhotoCard({
  title,
  desc,
  tag,
  read,
  tone,
  onOpen,
}: MediaProps & { desc: string; tag: string; read: string; tone: 'dog' | 'cat' | 'home' }) {
  return (
    <button type="button" className="media-card media-card--col" onClick={onOpen}>
      <Photo tone={tone} className="photo--fill" />
      <span className="media-card__text media-card__text--pad">
        <span className="visually-hidden">Стаття: </span>
        <Badge>{tag}</Badge>
        <span className="media-card__title media-card__title--h3">{title}</span>
        <span className="media-card__desc">{desc}</span>
        <span className="media-card__meta">
          <ClockIcon aria-hidden="true" />
          {tag} · {read}
        </span>
      </span>
    </button>
  );
}

export function ArticleTextCard({
  title,
  desc,
  tag,
  read,
  onOpen,
}: MediaProps & { desc: string; tag: string; read: string }) {
  return (
    <button type="button" className="media-card media-card--col" onClick={onOpen}>
      <span className="media-card__text media-card__text--pad">
        <span className="visually-hidden">Стаття: </span>
        <Badge>{tag}</Badge>
        <span className="media-card__title media-card__title--h3">{title}</span>
        <span className="media-card__desc">{desc}</span>
        <span className="media-card__meta">
          <ClockIcon aria-hidden="true" />
          {tag} · {read}
        </span>
      </span>
    </button>
  );
}

export function ArticleSideCard({
  title,
  tag,
  read,
  tone,
  tagTone = 'accent',
  onOpen,
  metaMode = 'tag',
}: MediaProps & { tag: string; read: string; tone: 'dog' | 'cat' | 'home'; tagTone?: 'accent' | 'warn' | 'info'; metaMode?: 'tag' | 'read' }) {
  return (
    <button type="button" className="media-card media-card--row media-card--row-start" onClick={onOpen}>
      <Photo tone={tone} className="photo--104" />
      <span className="media-card__text">
        <span className="visually-hidden">Стаття: </span>
        <Badge tone={tagTone}>{tag}</Badge>
        <span className="media-card__title media-card__title--h3">{title}</span>
        <span className="media-card__meta">
          <ClockIcon aria-hidden="true" />
          {metaMode === 'tag' ? `${tag} · ${read}` : read}
        </span>
      </span>
    </button>
  );
}

/* ---------- Пошук ---------- */
export function SearchField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const id = useId();
  return (
    <div className="search-group">
      <label className="t-small-strong" htmlFor={id}>
        {label}
      </label>
      <div className="search-field">
        <SearchIcon aria-hidden="true" />
        <input id={id} type="search" inputMode="search" autoComplete="off" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

/* ---------- Сегментований контрол (tablist) ---------- */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  asTabs = true,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  /** false: це кнопки-якорі до розділів сторінки (aria-pressed), а не вкладки з панелями */
  asTabs?: boolean;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent, i: number) => {
    let n = i;
    if (e.key === 'ArrowRight') n = (i + 1) % options.length;
    else if (e.key === 'ArrowLeft') n = (i - 1 + options.length) % options.length;
    else if (e.key === 'Home') n = 0;
    else if (e.key === 'End') n = options.length - 1;
    else return;
    e.preventDefault();
    onChange(options[n].value);
    refs.current[n]?.focus();
  };
  return (
    <div className="segmented" role={asTabs ? 'tablist' : 'group'} aria-label={label}>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role={asTabs ? 'tab' : undefined}
          id={`seg-${o.value}`}
          aria-selected={asTabs ? o.value === value : undefined}
          aria-pressed={asTabs ? undefined : o.value === value}
          tabIndex={!asTabs || o.value === value ? 0 : -1}
          className="segmented__item"
          onClick={() => onChange(o.value)}
          onKeyDown={asTabs ? (e) => onKey(e, i) : undefined}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Банер статусу ---------- */
export function Banner({ title, children, live = true }: { title: string; children: ReactNode; live?: boolean }) {
  return (
    <div className="banner content-in" role={live ? 'status' : undefined}>
      <span className="banner__title">{title}</span>
      <span className="banner__text">{children}</span>
    </div>
  );
}

/* ---------- Модальна нижня панель (S6) ---------- */
export function Sheet({
  open,
  onClose,
  title,
  children,
  initialFocus,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  initialFocus?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closing = useRef(false);

  const animateClose = (notify: boolean) => {
    const d = ref.current;
    if (!d || !d.open || closing.current) return;
    closing.current = true;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    d.dataset.closing = 'true';
    window.setTimeout(
      () => {
        d.close();
        delete d.dataset.closing;
        closing.current = false;
        if (notify) onClose();
      },
      reduce ? 0 : 250,
    );
  };
  const requestClose = () => animateClose(true);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      if (initialFocus) d.querySelector<HTMLElement>(initialFocus)?.focus();
    }
    if (!open && d.open) animateClose(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialFocus]);

  return (
    <dialog
      ref={ref}
      className="sheet"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) requestClose();
      }}
    >
      <div className="sheet__panel">
        <span className="sheet__grab" aria-hidden="true" />
        <div className="sheet__head">
          <h2 className="t-h1" id={titleId}>
            {title}
          </h2>
          <button type="button" className="text-action text-action--14" onClick={requestClose}>
            Закрити
          </button>
        </div>
        {open && children}
      </div>
    </dialog>
  );
}
