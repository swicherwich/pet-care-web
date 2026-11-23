import { Screen } from '../components/Shell';
import { TabCalendarIcon } from '../components/icons';
import { AppLink } from '../hooks/useAppNav';
import { PageHeader } from '../components/ui';

/** Заглушка: екран «Розклад» не входить до затвердженого макета ЛР6 */
export default function Schedule() {
  return (
    <Screen>
      <PageHeader title="Розклад" sub="Календар подій на тиждень" />
      <div className="stub">
        <span className="stub__icon" aria-hidden="true">
          <TabCalendarIcon />
        </span>
        <div className="stack-12" style={{ gap: 4 }}>
          <span className="badge badge--info" style={{ alignSelf: 'flex-start' }}>
            Поза макетом
          </span>
          <p className="lead" style={{ margin: 0 }}>
            Цього екрана немає в затвердженому макеті лабораторної роботи, тому тут лише заглушка. Вкладка залишена, щоб навігація відповідала карті потоків.
          </p>
        </div>
        <AppLink to="/" kind="tab" className="btn btn--secondary btn--l">
          Повернутися до «Сьогодні»
        </AppLink>
      </div>
    </Screen>
  );
}
