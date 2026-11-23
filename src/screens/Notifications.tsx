import { Screen } from '../components/Shell';
import { BackLink, PageHeader, SectionHeader, SettingToggleRow, SettingsCard } from '../components/ui';
import { useStore } from '../state/store';

interface Row {
  key: string;
  title: string;
  meta: string;
}

const groups: { id: string; title: string; rows: Row[] }[] = [
  {
    id: 'g-before',
    title: 'Нагадування наперед',
    rows: [
      { key: 'week', title: 'За 7 днів до обробки або щеплення', meta: 'Щоб встигнути купити препарат' },
      { key: 'dayBefore', title: 'За день до події', meta: 'Нагадування ввечері' },
      { key: 'dayOf', title: 'У день події', meta: 'О 09:00' },
    ],
  },
  {
    id: 'g-quiet',
    title: 'Менше шуму',
    rows: [
      { key: 'digest', title: 'Один підсумок замість кількох', meta: 'Усі події дня в одному сповіщенні' },
      { key: 'quiet', title: 'Тихі години', meta: 'З 22:00 до 07:00' },
    ],
  },
  {
    id: 'g-channels',
    title: 'Канали',
    rows: [
      { key: 'push', title: 'Push-сповіщення', meta: 'На цьому телефоні' },
      { key: 'mail', title: 'Підсумок дня на пошту', meta: 'Раз на день о 20:00' },
    ],
  },
];

export default function Notifications() {
  const { notify, setNotify } = useStore();
  return (
    <Screen>
      <BackLink label="Ще" fallback="/more" />
      <PageHeader title="Сповіщення" sub="Налаштуйте, коли і як вам нагадувати" />
      {groups.map((g) => (
        <section key={g.id} className="stack-12" aria-labelledby={g.id}>
          <SectionHeader id={g.id} title={g.title} tall={false} />
          <SettingsCard>
            {g.rows.map((r) => (
              <SettingToggleRow key={r.key} title={r.title} meta={r.meta} checked={notify[r.key]} onChange={(v) => setNotify(r.key, v)} />
            ))}
          </SettingsCard>
        </section>
      ))}
    </Screen>
  );
}
