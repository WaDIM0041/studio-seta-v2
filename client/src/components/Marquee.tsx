import { IconSparkle } from './icons';

const PHRASES = [
  'Маникюр',
  'Педикюр',
  'Укрепление Hard Gel',
  'Авторский дизайн',
  'Архитектура формы',
  'Идеальный срез',
  'Macro & Vogue',
];

export function Marquee() {
  const row = [...PHRASES, ...PHRASES];
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {row.map((p, i) => (
          <span className="marquee__item" key={i}>
            <span className="marquee__text">{p}</span>
            <IconSparkle size={13} />
          </span>
        ))}
      </div>
    </div>
  );
}
