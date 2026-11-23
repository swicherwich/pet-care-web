import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Banner } from '../components/blocks';
import { Screen } from '../components/Shell';
import { BackLink, Button, PageHeader, SectionHeader, SettingToggleRow, SettingsCard } from '../components/ui';
import { useStore } from '../state/store';
import { useOutOfScope } from '../hooks/useOutOfScope';
import { useToast } from '../state/toast';

function MemberRow({ title, meta }: { title: string; meta: string }) {
  return (
    <div className="setting-row static-row">
      <div className="setting-row__text">
        <span className="setting-row__title">{title}</span>
        <span className="setting-row__meta">{meta}</span>
      </div>
    </div>
  );
}

export default function Sharing() {
  const { invited, setInvited, showDoer, setShowDoer } = useStore();
  const toast = useToast();
  const outOfScope = useOutOfScope();
  const [params] = useSearchParams();
  const inviteBtn = useRef<HTMLButtonElement>(null);

  // Службовий параметр для перевірки макета: ?state=invited відкриває екран у стані «запрошення надіслано»
  useEffect(() => {
    if (params.get('state') === 'invited') setInvited(true);
  }, [params, setInvited]);

  const cancel = () => {
    setInvited(false);
    toast.show({ text: 'Запрошення скасовано' });
    window.requestAnimationFrame(() => inviteBtn.current?.focus());
  };

  return (
    <Screen>
      <BackLink label="Ще" fallback="/more" />
      <PageHeader title="Спільний доступ" sub="Діліться доглядом з родиною" />

      <section className="stack-12" aria-labelledby="g-members">
        <SectionHeader id="g-members" title="Учасники" tall={false} />
        <SettingsCard>
          <MemberRow title="Олег · власник" meta="Керує улюбленцями та доступом" />
          <MemberRow title="Наталя · може редагувати" meta="Бачить усі події й позначає виконані" />
        </SettingsCard>
      </section>

      {invited ? (
        <section className="stack-12 content-in" aria-labelledby="g-pending">
          <SectionHeader id="g-pending" title="Очікують відповіді" tall={false} />
          <SettingsCard>
            <div className="pending-row">
              <div className="pending-row__text">
                <span className="setting-row__title">Андрій</span>
                <span className="setting-row__meta">Запрошення надіслано сьогодні</span>
              </div>
              <button type="button" className="text-action text-action--14" aria-label="Скасувати запрошення для Андрія" onClick={cancel}>
                Скасувати
              </button>
            </div>
          </SettingsCard>
        </section>
      ) : (
        <section className="stack-12" aria-labelledby="g-doer">
          <SectionHeader id="g-doer" title="Хто що зробив" tall={false} />
          <SettingsCard>
            <SettingToggleRow
              title="Показувати ім’я виконавця"
              meta="Біля події видно, хто її виконав"
              checked={showDoer}
              onChange={setShowDoer}
            />
          </SettingsCard>
        </section>
      )}

      {invited && <Banner title="Запрошення надіслано">Андрій побачить його в застосунку або за посиланням.</Banner>}

      <Button
        ref={inviteBtn}
        variant={invited ? 'secondary' : 'primary'}
        block
        onClick={() => (invited ? outOfScope('Форма запрошення') : setInvited(true))}
      >
        {invited ? 'Запросити ще когось' : 'Запросити учасника'}
      </Button>
    </Screen>
  );
}
