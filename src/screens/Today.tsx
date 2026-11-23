import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { AlertCard, EventList, EventRow, Sheet, StatTile, VideoRowCard, ArticleSideCard } from '../components/blocks';
import { BellIcon, PlusIcon } from '../components/icons';
import { Screen } from '../components/Shell';
import { Button, ChipGroup, MoreAction, PageHeader, SectionHeader } from '../components/ui';
import { eventMeta, pets, petName, type CareEvent, type PetId } from '../data/mock';
import { AppLink } from '../hooks/useAppNav';
import { isFrameMode, useOutOfScope } from '../hooks/useOutOfScope';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';
import { NewEventSheet } from './NewEventSheet';

let skeletonShown = false;

const filterOptions: { value: 'all' | PetId; label: string }[] = [
  { value: 'all', label: 'Усі' },
  ...pets.map((p) => ({ value: p.id, label: p.name })),
];

function TodaySkeleton() {
  return (
    <Screen busy>
      <h1 className="visually-hidden">Сьогодні</h1>
      <p className="visually-hidden" role="status">
        Завантажуємо події
      </p>
      <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div className="skeleton" style={{ height: 60 }} />
        <div className="skeleton" style={{ height: 44 }} />
        <div className="skeleton" style={{ height: 163 }} />
        <div className="skeleton" style={{ height: 193 }} />
        <div className="skeleton" style={{ height: 262 }} />
        <div className="skeleton" style={{ height: 112 }} />
      </div>
    </Screen>
  );
}

export default function Today() {
  const { events, touched, toggleEvent, alertAnswer, setAlertAnswer } = useStore();
  const toast = useToast();
  const outOfScope = useOutOfScope();
  const [pet, setPet] = useState<'all' | PetId>('all');
  // Скелетон і каскад показуються лише при першому відкритті екрана за сесію (S1)
  const [cascade] = useState(() => !skeletonShown && !isFrameMode());
  const [loading, setLoading] = useState(cascade);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => {
      skeletonShown = true;
      setLoading(false);
    }, 1200); // S1: скелетон 1,2 с, далі каскад блоків
    return () => window.clearTimeout(t);
  }, [loading]);

  const visible = useMemo(() => events.filter((e) => pet === 'all' || e.petId === pet), [events, pet]);
  const overdue = visible.filter((e) => e.group === 'overdue');
  const today = visible.filter((e) => e.group === 'today');
  const doneCount = today.filter((e) => e.status === 'done').length;
  const detailEvent = events.find((e) => e.id === detail) ?? null;

  if (loading) return <TodaySkeleton />;

  const rv = (i: number, base = '') => ({
    className: [base, cascade && 'reveal'].filter(Boolean).join(' ') || undefined,
    style: cascade ? ({ '--i': i } as CSSProperties) : undefined,
  });

  const onToggle = (e: CareEvent) => {
    const changed = toggleEvent(e.id);
    if (!changed) return;
    if (changed.status === 'done') {
      toast.show({
        text: `«${e.title}» позначено виконаним`,
        action: { label: 'Скасувати', onClick: () => toggleEvent(e.id) },
      });
    }
  };

  const row = (e: CareEvent) => <EventRow key={e.id} event={e} onToggle={() => onToggle(e)} onOpen={() => setDetail(e.id)} />;
  const todayTitle = touched ? `Виконано · ${doneCount} з ${today.length}` : `Сьогодні · ${today.length}`;

  return (
    <Screen className="content--wide">
      <div {...rv(0, 'stack')}>
        <div className="header-row">
          <PageHeader title="Сьогодні" sub="Неділя, 18 жовтня" />
          <AppLink to="/notifications" state={{ backLabel: 'Сьогодні', backTo: '/' }} className="icon-btn" aria-label="Сповіщення">
            <BellIcon aria-hidden="true" />
          </AppLink>
          <button type="button" className="icon-btn icon-btn--solid" aria-label="Додати подію" onClick={() => setSheetOpen(true)}>
            <PlusIcon aria-hidden="true" />
          </button>
        </div>
        <ChipGroup label="Фільтр за улюбленцем" options={filterOptions} value={pet} onChange={setPet} />
      </div>

      <div className="cols cols--main">
        <div className="cols__col">
          {(pet === 'all' || pet === 'rex') && (
            <div {...rv(1)}>
              <AlertCard
                title={alertAnswer ? 'Дякуємо за відповідь' : 'Потрібен препарат?'}
                actions={
                  alertAnswer ? (
                    <Button variant="ghost" size="m" onClick={() => setAlertAnswer(null)}>
                      Змінити відповідь
                    </Button>
                  ) : (
                    <>
                      <Button variant="secondary" size="m" onClick={() => setAlertAnswer('have')}>
                        Вже є
                      </Button>
                      <Button size="m" onClick={() => setAlertAnswer('buy')}>
                        Треба купити
                      </Button>
                    </>
                  )
                }
              >
                {alertAnswer === 'have' && 'Позначили, що препарат від бліх для Рекса вже є.'}
                {alertAnswer === 'buy' && 'Позначили, що препарат від бліх для Рекса треба купити.'}
                {!alertAnswer && 'Обробка від бліх для Рекса через 7 днів. Препарат уже є?'}
              </AlertCard>
            </div>
          )}

          {overdue.length > 0 && (
            <section aria-labelledby="h-overdue" {...rv(2, 'section')}>
              <SectionHeader id="h-overdue" title={`Прострочено · ${overdue.length}`} />
              <EventList label="Прострочені події">{overdue.map(row)}</EventList>
            </section>
          )}

          <section aria-labelledby="h-today" {...rv(3, 'section')}>
            <SectionHeader
              id="h-today"
              title={
                <span key={todayTitle} className={touched ? 'swap' : undefined}>
                  {todayTitle}
                </span>
              }
            />
            {today.length > 0 ? (
              <EventList label="Події на сьогодні">{today.map(row)}</EventList>
            ) : (
              <p className="empty card">На сьогодні подій немає</p>
            )}
          </section>
        </div>

        <div className="cols__col">
          <div {...rv(4, 'stats')}>
            <StatTile label="Вага" value="28,4 кг" delta="+0,3 кг за місяць" />
            <StatTile label="Вага" value="28,4 кг" delta="+0,3 кг за місяць" />
          </div>

          <section aria-labelledby="h-media" {...rv(5, 'section')}>
            <SectionHeader id="h-media" title="Відео та поради" action={<MoreAction to="/tips" label="Усі відео та поради" />} />
            <VideoRowCard
              title="Як дати таблетку коту без стресу"
              meta="Кіт · 2:40 · Ветеринарна клініка"
              onOpen={() => outOfScope('Відео')}
            />
            <ArticleSideCard
              title="Скільки корму потрібно цуценяті"
              tag="Харчування"
              read="3 хв"
              metaMode="read"
              tone="home"
              onOpen={() => outOfScope('Стаття')}
            />
          </section>
        </div>
      </div>

      <NewEventSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      <Sheet open={!!detailEvent} onClose={() => setDetail(null)} title={detailEvent?.title ?? ''}>
        {detailEvent && (
          <>
            <dl style={{ display: 'flex', flexDirection: 'column', gap: 12, margin: 0 }}>
              <div className="kv">
                <dt>Улюбленець</dt>
                <dd>{petName(detailEvent.petId)}</dd>
              </div>
              <div className="kv">
                <dt>Деталі</dt>
                <dd>{eventMeta(detailEvent)}</dd>
              </div>
            </dl>
            <p className="caption-text">Сторінка події не входить до затвердженого макета, тому тут лише короткі відомості.</p>
            <div className="sheet__actions">
              <Button
                variant={detailEvent.status === 'done' ? 'secondary' : 'primary'}
                onClick={() => {
                  onToggle(detailEvent);
                  setDetail(null);
                }}
              >
                {detailEvent.status === 'done' ? 'Зняти відмітку' : 'Позначити виконаним'}
              </Button>
            </div>
          </>
        )}
      </Sheet>
    </Screen>
  );
}
