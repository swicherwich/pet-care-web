import { Screen } from '../components/Shell';
import { PageHeader, SettingLinkRow, SettingsCard } from '../components/ui';
import { useStore } from '../state/store';

export default function More() {
  const { invited } = useStore();
  return (
    <Screen>
      <PageHeader title="Ще" sub="Спільний доступ, нагадування й експорт" />
      <SettingsCard label="Розділи">
        <SettingLinkRow to="/sharing" title="Спільний доступ" meta={invited ? '2 учасники, 1 очікує відповіді' : '2 учасники'} />
        <SettingLinkRow to="/notifications" title="Сповіщення" meta="Нагадування за 7 днів, без нічного шуму" />
        <SettingLinkRow to="/export" title="Експорт для ветеринара" meta="PDF з історією щеплень і обробок" />
        <SettingLinkRow to="/tips" title="Поради та відео" meta="Статті й відео про догляд" />
      </SettingsCard>
    </Screen>
  );
}
