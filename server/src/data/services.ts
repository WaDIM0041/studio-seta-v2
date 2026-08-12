export interface ServiceDef {
  id: string;
  name: string;
  price: number;
  durationMin: number;
  category: string;
  note?: string;
  popular?: boolean;
}

export const SERVICES: ServiceDef[] = [
  {
    id: 'comb-manicure',
    name: 'Маникюр комби',
    price: 2200,
    durationMin: 90,
    category: 'Маникюр',
    note: 'Имеются противопоказания',
    popular: true,
  },
  {
    id: 'hard-gel',
    name: 'Укрепление Hard Gel',
    price: 2600,
    durationMin: 120,
    category: 'Маникюр',
    note: 'Имеются противопоказания. Возраст 16+',
    popular: true,
  },
  {
    id: 'extension',
    name: 'Донаращивание',
    price: 1800,
    durationMin: 90,
    category: 'Маникюр',
    note: 'Имеются противопоказания',
  },
  {
    id: 'gel-polish',
    name: 'Покрытие гель-лак',
    price: 800,
    durationMin: 45,
    category: 'Маникюр',
  },
  {
    id: 'design',
    name: 'Дизайн ногтей',
    price: 500,
    durationMin: 30,
    category: 'Дизайн',
  },
  {
    id: 'art-sculpt',
    name: 'Авторский дизайн SETA Art',
    price: 1500,
    durationMin: 60,
    category: 'Дизайн',
    note: 'Имеются противопоказания',
  },
  {
    id: 'pedicure',
    name: 'Педикюр аппаратный',
    price: 3000,
    durationMin: 120,
    category: 'Педикюр',
    note: 'Имеются противопоказания',
  },
  {
    id: 'removal',
    name: 'Снятие покрытия',
    price: 400,
    durationMin: 20,
    category: 'Уход',
  },
];

export function getService(id: string): ServiceDef {
  return SERVICES.find((s) => s.id === id) || SERVICES[0];
}
