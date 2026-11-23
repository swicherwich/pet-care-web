import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import Notifications from '../../src/screens/Notifications';
import Sharing from '../../src/screens/Sharing';
import Tips from '../../src/screens/Tips';
import Today from '../../src/screens/Today';
import { StoreProvider } from '../../src/state/store';
import { ToastProvider } from '../../src/state/toast';

const renderAt = (ui: React.ReactElement, path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <ToastProvider>
        <StoreProvider>{ui}</StoreProvider>
      </ToastProvider>
    </MemoryRouter>,
  );

beforeEach(() => {
  document.documentElement.dataset.frame = 'device'; // без скелетона й анімацій
});

describe('Екран «Сьогодні»', () => {
  it('показує групи подій із лічильниками', () => {
    renderAt(<Today />);
    expect(screen.getByRole('heading', { name: 'Прострочено · 2' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Сьогодні · 3' })).toBeInTheDocument();
  });

  it('після відмітки події заголовок переходить у режим «Виконано · N з M» (S8)', async () => {
    const user = userEvent.setup();
    renderAt(<Today />);
    await user.click(screen.getByRole('checkbox', { name: 'Ліки від алергії' }));
    expect(screen.getByRole('heading', { name: 'Виконано · 2 з 3' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Ліки від алергії' })).toBeChecked();
  });

  it('фільтр за улюбленцем залишає лише його події', async () => {
    const user = userEvent.setup();
    renderAt(<Today />);
    await user.click(screen.getByRole('radio', { name: 'Мурка' }));
    expect(screen.getByRole('checkbox', { name: 'Таблетка від глистів' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: 'Чистка вух' })).not.toBeInTheDocument();
  });

  it('кнопки підказки про препарат замінюють вміст відповіддю', async () => {
    const user = userEvent.setup();
    renderAt(<Today />);
    await user.click(screen.getByRole('button', { name: 'Треба купити' }));
    expect(screen.getByText(/треба купити\./)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Змінити відповідь' })).toBeInTheDocument();
  });

  it('порожня назва нової події дає помилку з aria-invalid та зв’язаним описом (S9)', async () => {
    const user = userEvent.setup();
    renderAt(<Today />);
    await user.click(screen.getByRole('button', { name: 'Додати подію' }));
    const dialog = document.querySelector('dialog')!;
    await user.click(within(dialog).getByRole('button', { name: 'Зберегти' }));
    const input = within(dialog).getByLabelText('Назва події');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Вкажіть назву події');
  });
});

describe('Екран «Поради та відео»', () => {
  it('фільтр «Відео» ховає статті', async () => {
    const user = userEvent.setup();
    renderAt(<Tips />);
    expect(screen.getByRole('heading', { name: 'Нові статті' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'Відео' }));
    expect(screen.queryByRole('heading', { name: 'Нові статті' })).not.toBeInTheDocument();
  });

  it('пошук без збігів показує повідомлення', async () => {
    const user = userEvent.setup();
    renderAt(<Tips />);
    await user.type(screen.getByRole('searchbox', { name: 'Пошук' }), 'ящірка');
    expect(screen.getByText(/Нічого не знайдено/)).toBeInTheDocument();
  });
});

describe('Екран «Сповіщення»', () => {
  it('перемикачі мають стан із макета й змінюються', async () => {
    const user = userEvent.setup();
    renderAt(<Notifications />);
    const mail = screen.getByRole('switch', { name: 'Підсумок дня на пошту' });
    expect(mail).not.toBeChecked();
    await user.click(mail);
    expect(mail).toBeChecked();
  });
});

describe('Екран «Спільний доступ»', () => {
  it('запрошення додає учасника в очікуванні та банер, скасування повертає початковий стан', async () => {
    const user = userEvent.setup();
    renderAt(<Sharing />, '/sharing');
    await user.click(screen.getByRole('button', { name: 'Запросити учасника' }));
    expect(screen.getByText('Очікують відповіді')).toBeInTheDocument();
    expect(screen.getAllByRole('status').some((el) => el.textContent?.includes('Запрошення надіслано'))).toBe(true);
    expect(screen.getByRole('button', { name: 'Запросити ще когось' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Скасувати запрошення/ }));
    expect(screen.getByRole('button', { name: 'Запросити учасника' })).toBeInTheDocument();
  });
});
