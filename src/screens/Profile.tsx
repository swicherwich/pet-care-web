import { useState } from 'react';
import { EventList, EventRow, Segmented, StatTile } from '../components/blocks';
import { DownloadIcon } from '../components/icons';
import { Screen } from '../components/Shell';
import { Badge, BackLink, MoreAction, Photo, SectionHeader } from '../components/ui';
import { notes, weightMonths, type CareEvent } from '../data/mock';
import { AppLink } from '../hooks/useAppNav';
import { useOutOfScope } from '../hooks/useOutOfScope';

type Part = 'overview' | 'history' | 'notes';

const upcomingInitial: CareEvent[] = [
  { id: 'u1', title: 'Глистогонне', petId: 'rex', group: 'today', status: 'todo', when: 'Завтра', meta: 'Завтра · 09:00' },
  { id: 'u2', title: 'Крапля від бліх', petId: 'rex', group: 'today', status: 'todo', when: '25 жовтня', meta: '25 жовтня · раз на місяць' },
];

const chartText = 'Діаграма вище показує вагу за п’ять місяців, від червня до жовтня: вона зросла на 0,3 кг за останні три місяці.';

function WeightCard() {
  return (
    <section className="weight-card" aria-labelledby="w-title">
      <div className="stack-12" style={{ gap: 0 }}>
        <span className="caption-text" id="w-title">
          Вага Рекса
        </span>
        <span className="stat-tile__value">28,4 кг</span>
        <span className="stat-tile__delta" style={{ color: 'var(--color-text)' }}>
          +0,3 кг за 3 місяці
        </span>
      </div>
      <div className="weight-card__plot">
        <svg viewBox="0 0 329 128" preserveAspectRatio="none" fill="none" role="img" aria-labelledby="w-desc">
          <path d="M0 32H329M0 64H329M0 96H329" stroke="var(--color-divider)" />
          <path d="M8 104L88 92L168 72L248 74L321 44V128H8V104Z" fill="var(--color-accent-soft)" />
          <path d="M8 104L88 92L168 72L248 74L321 44" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <div className="weight-card__axis" aria-hidden="true">
        {weightMonths.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
      <span id="w-desc" className="visually-hidden">
        {chartText}
      </span>
    </section>
  );
}

export default function Profile() {
  const outOfScope = useOutOfScope();
  const [part, setPart] = useState<Part>('overview');
  const [upcoming, setUpcoming] = useState(upcomingInitial);

  const go = (p: Part) => {
    setPart(p);
    const target = p === 'overview' ? 'profile-top' : p === 'history' ? 'h-upcoming' : 'h-notes';
    const el = document.getElementById(target);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  };

  const toggle = (id: string) =>
    setUpcoming((l) => l.map((e) => (e.id === id ? { ...e, status: e.status === 'done' ? 'todo' : 'done', doneBy: 'Олег', doneAt: new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', hour12: false }) } : e)));

  return (
    <Screen>
      <div className="topbar">
        <BackLink label="Улюбленці" fallback="/" />
        <AppLink to="/export" className="text-action text-action--16">
          <DownloadIcon width={20} height={20} aria-hidden="true" />
          <span>Експорт</span>
        </AppLink>
      </div>

      <div id="profile-top" className="profile-head">
        <Photo tone="dog" className="hero-photo" />
        <div className="profile-head__text">
          <h1 className="t-h1" tabIndex={-1} style={{ margin: 0 }}>
            Рекс
          </h1>
          <p className="lead">Пес · лабрадор · 3 роки · чіп є</p>
        </div>
        <div className="badges">
          <Badge>Щеплення актуальні</Badge>
          <Badge tone="warn">Алергія на курку</Badge>
        </div>
        <Segmented
          asTabs={false}
          label="Розділи профілю"
          value={part}
          onChange={go}
          options={[
            { value: 'overview', label: 'Огляд' },
            { value: 'history', label: 'Історія' },
            { value: 'notes', label: 'Нотатки' },
          ]}
        />
      </div>

      <div className="stats">
        <StatTile label="Вага" value="28,4 кг" delta="+0,3 кг за місяць" />
        <StatTile label="Вага" value="28,4 кг" delta="+0,3 кг за місяць" />
      </div>

      <WeightCard />
      <p className="caption-text">
        {chartText}
      </p>

      <section className="section" aria-labelledby="h-upcoming">
        <SectionHeader id="h-upcoming" title="Найближчі події" />
        <EventList label="Найближчі події">
          {upcoming.map((e) => (
            <EventRow key={e.id} event={e} onToggle={() => toggle(e.id)} onOpen={() => outOfScope('Подія')} />
          ))}
        </EventList>
      </section>

      <section className="section" aria-labelledby="h-photos">
        <SectionHeader id="h-photos" title="Фото" action={<MoreAction label="Усі фото, 24" text="Усі 24" onClick={() => outOfScope('Фотоальбом')} />} />
        <div className="photo-grid">
          {(['dog', 'home', 'cat'] as const).map((tone, i) => (
            <button key={tone} type="button" aria-label={`Фото ${i + 1} із 24`} onClick={() => outOfScope('Фотоальбом')}>
              <Photo tone={tone} />
            </button>
          ))}
        </div>
      </section>

      <section className="section" aria-labelledby="h-notes">
        <SectionHeader id="h-notes" title="Нотатки" action={<MoreAction label="Усі нотатки" onClick={() => outOfScope('Нотатки')} />} />
        <div className="notes">
          {notes.map((n) => (
            <article key={n.id} className="note-card">
              <p style={{ margin: 0 }}>{n.text}</p>
              <div className="note-card__meta">
                <span>{n.meta}</span>
                <Badge>{n.tag}</Badge>
              </div>
            </article>
          ))}
        </div>
      </section>
    </Screen>
  );
}
