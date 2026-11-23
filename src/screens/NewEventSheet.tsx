import { useEffect, useId, useRef, useState } from 'react';
import { Sheet } from '../components/blocks';
import { Button, Hint } from '../components/ui';
import { AlertIcon } from '../components/icons';
import { pets, remindOptions, type PetId } from '../data/mock';
import { useStore } from '../state/store';
import { useToast } from '../state/toast';

export function NewEventSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addEvent } = useStore();
  const toast = useToast();
  const uid = useId();
  const titleRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [pet, setPet] = useState<PetId>('rex');
  const [time, setTime] = useState('18:00');
  const [remind, setRemind] = useState('day');
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setError(false);
      setSaving(false);
    }
  }, [open]);

  const shake = () => {
    const el = titleRef.current;
    if (!el) return;
    el.classList.remove('shake');
    void el.offsetWidth; // перезапуск анімації
    el.classList.add('shake');
  };

  const save = () => {
    if (!title.trim()) {
      setError(true); // S9: поле підсвічується, текст помилки лишається на екрані
      shake();
      titleRef.current?.focus();
      return;
    }
    setSaving(true); // S2: проміжний стан «Збереження…»
    window.setTimeout(() => {
      addEvent({ title: title.trim(), petId: pet, time });
      setSaving(false);
      onClose();
      toast.show({ text: 'Подію збережено', persistent: true });
    }, 1000);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Нова подія" initialFocus="input[name=title]">
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div className="field">
          <label className="field__label" htmlFor={`${uid}-title`}>
            Назва події
          </label>
          <input
            ref={titleRef}
            id={`${uid}-title`}
            name="title"
            className="field__input"
            type="text"
            placeholder="Наприклад, глистогонне"
            value={title}
            aria-invalid={error || undefined}
            aria-describedby={error ? `${uid}-err` : undefined}
            aria-required="true"
            autoComplete="off"
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(false);
            }}
          />
          {error && (
            <p className="field__error" id={`${uid}-err`}>
              <AlertIcon aria-hidden="true" />
              Вкажіть назву події
            </p>
          )}
        </div>

        <div className="field">
          <label className="field__label" htmlFor={`${uid}-pet`}>
            Улюбленець
          </label>
          <select id={`${uid}-pet`} className="field__input" value={pet} onChange={(e) => setPet(e.target.value as PetId)}>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field__label" htmlFor={`${uid}-time`}>
            Час
          </label>
          <input id={`${uid}-time`} className="field__input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </div>

        <div className="field-row">
          <div className="field">
            <label className="field__label" htmlFor={`${uid}-remind`}>
              Нагадати за
            </label>
            <select id={`${uid}-remind`} className="field__input" value={remind} onChange={(e) => setRemind(e.target.value)}>
              {remindOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Hint
            label="Підказка про нагадування"
            text="Для обробок від паразитів краще нагадувати за 7 днів, щоб встигнути купити препарат."
          />
        </div>

        <div className="sheet__actions">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Скасувати
          </Button>
          <Button type="submit" loading={saving}>
            {saving ? 'Збереження…' : 'Зберегти'}
          </Button>
        </div>
      </form>
    </Sheet>
  );
}
