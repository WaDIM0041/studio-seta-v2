import { useMemo, useState } from 'react';
import { MacroArt, type Tone, type Variant } from './art/MacroArt';
import { Reveal } from '../lib/hooks';
import { useBooking } from '../context/BookingContext';

interface PortfolioItem {
  id: string;
  service: string;
  price: number;
  category: string;
  variant: Variant;
  tone: Tone;
  direction: string;
  tall?: boolean;
}

const ITEMS: PortfolioItem[] = [
  { id: 'p1', service: 'Маникюр комби + покрытие', price: 3000, category: 'Маникюр', variant: 'droplet', tone: 'graphite', direction: 'Капля густого топа на идеальной поверхности', tall: true },
  { id: 'p2', service: 'Классический френч', price: 2200, category: 'Дизайн', variant: 'french', tone: 'bone', direction: 'Идеальный френч, flatlay' },
  { id: 'p3', service: 'Укрепление Hard Gel', price: 2600, category: 'Маникюр', variant: 'rings', tone: 'champagne', direction: 'Руки с минималистичными кольцами на чёрном бархате' },
  { id: 'p4', service: 'Авторский дизайн SETA Art', price: 1500, category: 'Дизайн', variant: 'golden', tone: 'graphite', direction: 'Холодный неоновый блик на глубоком графите', tall: true },
  { id: 'p5', service: 'Покрытие гель-лак', price: 800, category: 'Маникюр', variant: 'droplet', tone: 'rose', direction: 'Макро капля базы, розовый оттенок' },
  { id: 'p6', service: 'Педикюр аппаратный', price: 3000, category: 'Педикюр', variant: 'french', tone: 'noir', direction: 'Профиль руки, студийный свет' },
  { id: 'p7', service: 'Дизайн ногтей', price: 500, category: 'Дизайн', variant: 'rings', tone: 'noir', direction: 'Золотые кольца на чёрном бархате' },
  { id: 'p8', service: 'Донаращивание', price: 1800, category: 'Маникюр', variant: 'golden', tone: 'champagne', direction: 'Тёплый золотой блик' },
  { id: 'p9', service: 'Снятие покрытия + уход', price: 900, category: 'Уход', variant: 'droplet', tone: 'bone', direction: 'Чистота и порядок, flatlay' },
  { id: 'p10', service: 'Архитектура формы', price: 2400, category: 'Маникюр', variant: 'french', tone: 'rose', direction: 'Профиль руки, естественный студийный свет', tall: true },
];

const CATEGORIES = ['Все', 'Маникюр', 'Дизайн', 'Педикюр', 'Уход'];

export function Portfolio() {
  const [cat, setCat] = useState('Все');
  const { openBooking } = useBooking();

  const items = useMemo(
    () => (cat === 'Все' ? ITEMS : ITEMS.filter((i) => i.category === cat)),
    [cat],
  );

  return (
    <section className="section portfolio" id="portfolio">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">Портфолио</p>
              <h2 className="section-title">
                Работы студии
              </h2>
            </div>
            <div className="portfolio__filters" role="tablist" aria-label="Категории работ">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`chip ${cat === c ? 'chip--active' : ''}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="portfolio__masonry">
          {items.map((item, i) => (
            <Reveal key={item.id} delay={Math.min(i, 6) * 70} className={`masonry-card ${item.tall ? 'masonry-card--tall' : ''}`}>
              <figure className="masonry-card__media">
                <MacroArt variant={item.variant} tone={item.tone} />
                <figcaption className="masonry-card__plaque">
                  <div>
                    <span className="masonry-card__dir">{item.direction}</span>
                    <span className="masonry-card__name">{item.service}</span>
                  </div>
                  <span className="masonry-card__price">
                    {item.price.toLocaleString('ru-RU')} ₽
                  </span>
                  <button
                    className="masonry-card__cta"
                    onClick={() => openBooking(item.id)}
                    tabIndex={-1}
                  >
                    Записаться
                  </button>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
