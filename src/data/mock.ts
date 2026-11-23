export type PetId = 'rex' | 'murka' | 'barsyk';

export interface Pet {
  id: PetId;
  name: string;
}

export const pets: Pet[] = [
  { id: 'rex', name: 'Рекс' },
  { id: 'murka', name: 'Мурка' },
  { id: 'barsyk', name: 'Барсик' },
];

export const petName = (id: PetId) => pets.find((p) => p.id === id)!.name;

export type EventStatus = 'todo' | 'done' | 'overdue';

export interface CareEvent {
  id: string;
  title: string;
  petId: PetId;
  /** Тип запису у списку: прострочено чи на сьогодні (визначає групу, а не поточний статус) */
  group: 'overdue' | 'today';
  status: EventStatus;
  /** Час або підпис дня для рядка-підказки: «13:00» або «Вчора» */
  when: string;
  doneBy?: string;
  doneAt?: string;
  isNew?: boolean;
  /** Готовий підпис другого рядка (для подій на екрані профілю) */
  meta?: string;
}

export const initialEvents: CareEvent[] = [
  { id: 'e1', title: 'Таблетка від глистів', petId: 'murka', group: 'overdue', status: 'overdue', when: 'Вчора' },
  { id: 'e2', title: 'Чистка вух', petId: 'barsyk', group: 'overdue', status: 'overdue', when: 'Вчора' },
  {
    id: 'e3',
    title: 'Ранкове годування',
    petId: 'murka',
    group: 'today',
    status: 'done',
    when: '08:12',
    doneBy: 'Наталя',
    doneAt: '08:12',
  },
  { id: 'e4', title: 'Ліки від алергії', petId: 'rex', group: 'today', status: 'todo', when: '13:00' },
  { id: 'e5', title: 'Вечірнє годування', petId: 'barsyk', group: 'today', status: 'todo', when: '19:00' },
];

export const eventMeta = (e: CareEvent): string => {
  if (e.status === 'done') return `Зроблено · ${e.doneBy}, ${e.doneAt}`;
  if (e.meta) return e.meta;
  return `${e.when} · ${petName(e.petId)}`;
};

export const petGenitive: Record<PetId, string> = { rex: 'Рекса', murka: 'Мурки', barsyk: 'Барсика' };

export const remindOptions = [
  { value: 'none', label: 'Не нагадувати' },
  { value: 'day', label: 'За день' },
  { value: 'week', label: 'За 7 днів' },
];

export interface Article {
  id: string;
  title: string;
  desc?: string;
  tag: 'Догляд' | 'Харчування' | 'Здоров’я' | 'Дресирування';
  read: string;
  tone: 'dog' | 'cat' | 'home';
  variant: 'photo' | 'text' | 'side';
}

export const articles: Article[] = [
  {
    id: 'a1',
    title: 'Як підготувати кота до візиту до ветеринара',
    desc: 'Переноска, ласощі та спокійний маршрут допоможуть уникнути стресу.',
    tag: 'Догляд',
    read: '4 хв читання',
    tone: 'home',
    variant: 'photo',
  },
  {
    id: 'a2',
    title: 'Скільки годувати лабрадора щодня',
    desc: 'Норми порцій за вагою й віком, з прикладами для активних собак.',
    tag: 'Харчування',
    read: '6 хв читання',
    tone: 'dog',
    variant: 'text',
  },
  {
    id: 'a3',
    title: 'Календар щеплень для собак',
    tag: 'Здоров’я',
    read: '5 хв читання',
    tone: 'home',
    variant: 'side',
  },
];

export interface Video {
  id: string;
  title: string;
  tag: string;
  duration: string;
}

export const featuredVideo: Video = { id: 'v0', title: 'Базові команди: сидіти, поруч, місце', tag: 'Дресирування', duration: '2:40' };
export const videos: Video[] = [
  { id: 'v1', title: 'Перші дні цуценяти вдома', tag: 'Дресирування', duration: '8:24' },
  { id: 'v2', title: 'Масаж для кота: з чого почати', tag: 'Догляд', duration: '5:10' },
];

export const tipFilters = ['Усі', 'Здоров’я', 'Харчування', 'Догляд', 'Відео'] as const;
export type TipFilter = (typeof tipFilters)[number];

export interface Note {
  id: string;
  text: string;
  meta: string;
  tag: string;
  tone: 'accent' | 'warn';
}

export const notes: Note[] = [
  {
    id: 'n1',
    text: 'Не любить таблетки, ховається під ліжко. Дати зі шматочком сиру.',
    meta: '10 жовтня · Наталя',
    tag: 'Здоров’я',
    tone: 'accent',
  },
  {
    id: 'n2',
    text: 'Алергія на курку, корм лише з індичкою. Перевіряти склад ласощів.',
    meta: '2 вересня · Олег',
    tag: 'Харчування',
    tone: 'accent',
  },
];

export const weightMonths = ['Чер', 'Лип', 'Сер', 'Вер', 'Жов'];
