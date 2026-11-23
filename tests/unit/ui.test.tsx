import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { EventRow } from '../../src/components/blocks';
import { ChipGroup, SettingToggleRow } from '../../src/components/ui';
import { eventMeta, initialEvents } from '../../src/data/mock';

function Chips() {
  const [v, setV] = useState('a');
  return (
    <ChipGroup
      label="Фільтр"
      value={v}
      onChange={setV}
      options={[
        { value: 'a', label: 'Усі' },
        { value: 'b', label: 'Рекс' },
        { value: 'c', label: 'Мурка' },
      ]}
    />
  );
}

describe('ChipGroup', () => {
  it('є radiogroup, вибраний чип має aria-checked і tabIndex 0', () => {
    render(<Chips />);
    const group = screen.getByRole('radiogroup', { name: 'Фільтр' });
    expect(group).toBeInTheDocument();
    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
    expect(radios[0]).toHaveAttribute('tabindex', '0');
    expect(radios[1]).toHaveAttribute('tabindex', '-1');
  });

  it('стрілки змінюють вибір і переносять фокус, з останнього повертає на перший', async () => {
    const user = userEvent.setup();
    render(<Chips />);
    const radios = screen.getAllByRole('radio');
    radios[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(radios[1]).toHaveAttribute('aria-checked', 'true');
    expect(radios[1]).toHaveFocus();
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(radios[0]).toHaveAttribute('aria-checked', 'true');
  });
});

describe('SettingToggleRow', () => {
  it('має роль switch з назвою й описом, клік перемикає стан', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SettingToggleRow title="Тихі години" meta="З 22:00 до 07:00" checked={true} onChange={onChange} />);
    const sw = screen.getByRole('switch', { name: 'Тихі години' });
    expect(sw).toHaveAccessibleDescription('З 22:00 до 07:00');
    expect(sw).toBeChecked();
    await user.click(sw);
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('клік по рядку вмикає перемикач, але не викликає зміну двічі', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<SettingToggleRow title="Push" meta="На цьому телефоні" checked={false} onChange={onChange} />);
    await user.click(screen.getByText('На цьому телефоні'));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe('EventRow', () => {
  const overdue = initialEvents[0];
  const done = initialEvents[2];

  it('відмітка виконання є checkbox з назвою події та описом', () => {
    render(
      <MemoryRouter>
        <EventRow event={done} onToggle={() => undefined} onOpen={() => undefined} />
      </MemoryRouter>,
    );
    const box = screen.getByRole('checkbox', { name: 'Ранкове годування' });
    expect(box).toBeChecked();
    expect(box).toHaveAccessibleDescription('Зроблено · Наталя, 08:12');
  });

  it('прострочена подія показує підпис дня й улюбленця, а клік по відмітці викликає onToggle', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <MemoryRouter>
        <EventRow event={overdue} onToggle={onToggle} onOpen={() => undefined} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Вчора · Мурка')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});

describe('eventMeta', () => {
  it('формує другий рядок для різних станів', () => {
    expect(eventMeta(initialEvents[3])).toBe('13:00 · Рекс');
    expect(eventMeta(initialEvents[2])).toBe('Зроблено · Наталя, 08:12');
    expect(eventMeta({ ...initialEvents[3], meta: 'Завтра · 09:00' })).toBe('Завтра · 09:00');
  });
});
