import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../components/blocks';
import { Screen } from '../components/Shell';
import { BackLink, Button, ChipGroup, PageHeader, SectionHeader, SettingToggleRow, SettingsCard } from '../components/ui';
import { pets, petGenitive, petName, type PetId } from '../data/mock';
import { useToast } from '../state/toast';

type Period = 'all' | '12' | '6';
type Step = 'form' | 'creating' | 'ready';

const periodOptions: { value: Period; label: string }[] = [
  { value: 'all', label: 'Усі записи' },
  { value: '12', label: '12 місяців' },
  { value: '6', label: '6 місяців' },
];
const periodText: Record<Period, string> = { all: 'за весь час', '12': 'за 12 місяців', '6': 'за 6 місяців' };

const includeRows = [
  { key: 'vacc', title: 'Щеплення', meta: 'Дати й назви вакцин', word: 'щеплення' },
  { key: 'paras', title: 'Обробки від паразитів', meta: 'Бліхи, кліщі, глисти', word: 'обробки' },
  { key: 'visits', title: 'Візити до ветеринара', meta: 'Дати та нотатки лікаря', word: 'візити' },
  { key: 'weight', title: 'Вага і нотатки', meta: 'Динаміка ваги, власні записи', word: 'вага, нотатки' },
] as const;

const petOptions = pets.map((p) => ({ value: p.id, label: p.name }));

export default function Export() {
  const [params] = useSearchParams();
  const toast = useToast();
  const [pet, setPet] = useState<PetId>('rex');
  const [period, setPeriod] = useState<Period>('all');
  const [inc, setInc] = useState<Record<string, boolean>>({ vacc: true, paras: true, visits: true, weight: false });
  // Службовий параметр для перевірки макета: ?state=ready відкриває екран у стані «файл готовий»
  const [step, setStep] = useState<Step>(params.get('state') === 'ready' ? 'ready' : 'form');
  const timer = useRef<number | undefined>(undefined);
  const readyRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (params.get('state') === 'ready') setStep('ready');
  }, [params]);

  const words = useMemo(() => includeRows.filter((r) => inc[r.key]).map((r) => r.word), [inc]);
  const summary = words.length ? words.join(', ') : 'без розділів';
  const anything = words.length > 0;
  const fileName = `${petName(pet)} · історія.pdf`;

  const create = () => {
    setStep('creating'); // P3: проміжний стан «Створюю PDF…»
    timer.current = window.setTimeout(() => {
      setStep('ready');
      window.requestAnimationFrame(() => readyRef.current?.focus());
    }, 1500);
  };

  const share = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}files/demo-history.pdf`);
      const blob = await res.blob();
      const file = new File([blob], `${petName(pet)}-історія.pdf`, { type: 'application/pdf' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: fileName });
        return;
      }
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
    }
    toast.show({
      text: 'Системне меню «Поділитися» недоступне в цьому браузері. Збережіть файл і надішліть його вручну.',
      persistent: true,
    });
  };

  const save = () => {
    const a = document.createElement('a');
    a.href = `${import.meta.env.BASE_URL}files/demo-history.pdf`;
    a.download = `${petName(pet)}-історія.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.show({ text: 'Файл збережено в завантаження' });
  };

  return (
    <Screen>
      <BackLink label="Ще" fallback="/more" />
      <PageHeader title="Експорт для ветеринара" sub="PDF з історією щеплень і обробок" />

      {step === 'ready' ? (
        <>
          <div ref={readyRef} tabIndex={-1} style={{ outline: 'none' }}>
            <Banner title="Файл готовий">{`Історія ${petGenitive[pet]}: ${summary} ${periodText[period]}.`}</Banner>
          </div>
          <section className="stack-12" aria-labelledby="g-file">
            <SectionHeader id="g-file" title="Файл" tall={false} />
            <div className="setting-row" style={{ borderRadius: 16, border: '1px solid var(--color-divider)' }}>
              <div className="setting-row__text">
                <span className="setting-row__title">{fileName}</span>
                <span className="setting-row__meta">
                  {words.length ? words.map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join(', ') : 'Порожній звіт'}
                </span>
              </div>
            </div>
          </section>
          <div className="stack-12">
            <Button block onClick={share}>
              Поділитися
            </Button>
            <Button variant="secondary" block onClick={save}>
              Зберегти на телефон
            </Button>
          </div>
        </>
      ) : (
        <>
          <section className="stack-12" aria-labelledby="g-pet">
            <SectionHeader id="g-pet" title="Улюбленець" tall={false} />
            <ChipGroup labelledBy="g-pet" options={petOptions} value={pet} onChange={setPet} />
          </section>
          <section className="stack-12" aria-labelledby="g-period">
            <SectionHeader id="g-period" title="Період" tall={false} />
            <ChipGroup labelledBy="g-period" options={periodOptions} value={period} onChange={setPeriod} />
          </section>
          <section className="stack-12" aria-labelledby="g-inc">
            <SectionHeader id="g-inc" title="Що включити" tall={false} />
            <SettingsCard>
              {includeRows.map((r) => (
                <SettingToggleRow
                  key={r.key}
                  title={r.title}
                  meta={r.meta}
                  checked={inc[r.key]}
                  onChange={(v) => setInc((s) => ({ ...s, [r.key]: v }))}
                />
              ))}
            </SettingsCard>
          </section>
          <Button block onClick={create} loading={step === 'creating'} disabled={!anything}>
            {step === 'creating' ? 'Створюю PDF…' : 'Створити PDF'}
          </Button>
          {!anything && (
            <p className="caption-text" role="status" style={{ marginTop: -8 }}>
              Увімкніть хоча б один розділ, щоб створити файл.
            </p>
          )}
          <p className="visually-hidden" role="status">
            {step === 'creating' ? 'Створюємо PDF' : ''}
          </p>
        </>
      )}
    </Screen>
  );
}
