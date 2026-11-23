import { useId, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightSmIcon, PawIcon } from './icons';
import { useLocation } from 'react-router-dom';
import { AppLink, useAppNav } from '../hooks/useAppNav';

/* ---------- Кнопка ---------- */
type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'l' | 'm';
  block?: boolean;
  grow?: boolean;
  loading?: boolean;
};

export function Button({ variant = 'primary', size = 'l', block, grow, loading, className = '', children, disabled, ...rest }: ButtonProps) {
  const cls = ['btn', `btn--${variant}`, `btn--${size}`, block && 'btn--block', grow && 'btn--grow', className].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {children}
    </button>
  );
}

/* ---------- Група чипів (radiogroup із прокруткою стрілками) ---------- */
interface ChipOption<T extends string> {
  value: T;
  label: string;
}

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  labelledBy,
}: {
  label?: string;
  labelledBy?: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const move = (e: KeyboardEvent, index: number) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next = index;
    if (e.key in keys) next = (index + keys[e.key] + options.length) % options.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = options.length - 1;
    else return;
    e.preventDefault();
    onChange(options[next].value);
    refs.current[next]?.focus();
  };
  return (
    <div className="chips" role="radiogroup" aria-label={label} aria-labelledby={labelledBy}>
      {options.map((o, i) => (
        <button
          key={o.value}
          ref={(el) => {
            refs.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          tabIndex={o.value === value ? 0 : -1}
          className="chip"
          onClick={() => onChange(o.value)}
          onKeyDown={(e) => move(e, i)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Перемикач ---------- */
export function Toggle({
  checked,
  onChange,
  labelledBy,
  describedBy,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labelledBy: string;
  describedBy?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="toggle"
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <span className="toggle__track">
        <span className="toggle__knob" />
      </span>
    </button>
  );
}

/* ---------- Рядки налаштувань ---------- */
export function SettingToggleRow({
  title,
  meta,
  checked,
  onChange,
}: {
  title: string;
  meta: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const id = useId();
  return (
    <div className="setting-row" onClick={() => onChange(!checked)}>
      <div className="setting-row__text">
        <span className="setting-row__title" id={`${id}-t`}>
          {title}
        </span>
        <span className="setting-row__meta" id={`${id}-m`}>
          {meta}
        </span>
      </div>
      <Toggle checked={checked} onChange={onChange} labelledBy={`${id}-t`} describedBy={`${id}-m`} />
    </div>
  );
}

export function SettingLinkRow({ to, title, meta }: { to: string; title: string; meta: string }) {
  return (
    <AppLink to={to} className="setting-row setting-row--menu">
      <span className="setting-row__text">
        <span className="setting-row__title">{title}</span>
        <span className="setting-row__meta">{meta}</span>
      </span>
      <HubChevron />
    </AppLink>
  );
}

function HubChevron() {
  return (
    <svg className="setting-row__chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SettingsCard({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="settings-card" role={label ? 'group' : undefined} aria-label={label}>
      {children}
    </div>
  );
}

/* ---------- Заголовки ---------- */
export function PageHeader({ title, sub, id }: { title: string; sub?: string; id?: string }) {
  return (
    <div className="page-header">
      <h1 className="page-header__title" id={id} tabIndex={-1}>
        {title}
      </h1>
      {sub && <p className="page-header__sub">{sub}</p>}
    </div>
  );
}

export function SectionHeader({
  title,
  id,
  action,
  tall = true,
}: {
  title: ReactNode;
  id?: string;
  action?: ReactNode;
  /** Висота 44 px, як у блоках із дією (ЛР6); для простих підписів груп вимкнено */
  tall?: boolean;
}) {
  return (
    <div className="section-header" style={tall ? undefined : { minHeight: 0 }}>
      <h2 className="t-h3 section-header__title" id={id}>
        {title}
      </h2>
      {action}
    </div>
  );
}

/** Дія «Усі» з ціллю 44x44 та доступною назвою, що розрізняє однакові підписи (P10) */
export function MoreAction({ to, onClick, label, text = 'Усі' }: { to?: string; onClick?: () => void; label: string; text?: string }) {
  const inner = (
    <>
      <span className="text-action text-action--14">{text}</span>
      <ChevronRightSmIcon />
    </>
  );
  if (to) {
    return (
      <AppLink to={to} aria-label={label} className="more-action">
        {inner}
      </AppLink>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className="more-action">
      {inner}
    </button>
  );
}

/** Стан, який передає посилання, щоб «Назад» називався за екраном, з якого прийшов користувач */
export interface BackState {
  backLabel: string;
  backTo: string;
}

export function BackLink({ label, fallback }: { label: string; fallback: string }) {
  const { back } = useAppNav();
  const st = useLocation().state as Partial<BackState> | null;
  const text = st?.backLabel ?? label;
  const target = st?.backTo ?? fallback;
  return (
    <button type="button" className="text-action text-action--16" onClick={() => back(target)} aria-label={`Назад: ${text}`}>
      <ChevronLeftIcon width={24} height={24} />
      <span>{text}</span>
    </button>
  );
}

/* ---------- Фото-заглушка та бейдж ---------- */
export function Photo({ tone, className = '' }: { tone: 'dog' | 'cat' | 'home'; className?: string }) {
  return (
    <span className={`photo photo--${tone} ${className}`} aria-hidden="true">
      <PawIcon />
    </span>
  );
}

export function Badge({ tone = 'accent', children }: { tone?: 'accent' | 'warn' | 'info'; children: ReactNode }) {
  return <span className={`badge ${tone === 'accent' ? '' : `badge--${tone}`}`}>{children}</span>;
}

/* ---------- Підказка біля поля (S4) ---------- */
export function Hint({ text, label }: { text: string; label: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="hint">
      <button
        type="button"
        className="hint__btn"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        <span className="hint__icon" aria-hidden="true">
          ?
        </span>
      </button>
      {open && (
        <span className="hint__bubble" id={id} role="note">
          {text}
        </span>
      )}
    </span>
  );
}
