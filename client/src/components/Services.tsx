import { SITE } from '../lib/site';
import { useBooking } from '../context/BookingContext';
import { Reveal } from '../lib/hooks';
import type { ServiceDef } from '../lib/api';

const SERVICES_FALLBACK: ServiceDef[] = [
  { id: 'comb-manicure', name: 'Маникюр комби', price: 2200, durationMin: 90, category: 'Маникюр', note: 'Имеются противопоказания', popular: true },
  { id: 'hard-gel', name: 'Укрепление Hard Gel', price: 2600, durationMin: 120, category: 'Маникюр', note: 'Имеются противопоказания. Возраст 16+', popular: true },
  { id: 'extension', name: 'Донаращивание', price: 1800, durationMin: 90, category: 'Маникюр', note: 'Имеются противопоказания' },
  { id: 'gel-polish', name: 'Покрытие гель-лак', price: 800, durationMin: 45, category: 'Маникюр' },
  { id: 'design', name: 'Дизайн ногтей', price: 500, durationMin: 30, category: 'Дизайн' },
  { id: 'art-sculpt', name: 'Авторский дизайн SETA Art', price: 1500, durationMin: 60, category: 'Дизайн', note: 'Имеются противопоказания' },
  { id: 'pedicure', name: 'Педикюр аппаратный', price: 3000, durationMin: 120, category: 'Педикюр', note: 'Имеются противопоказания' },
  { id: 'removal', name: 'Снятие покрытия', price: 400, durationMin: 20, category: 'Уход' },
];

function formatPrice(value: number): string {
  return `${value.toLocaleString('ru-RU')} ₽`;
}

export function Services({ services }: { services: ServiceDef[] }) {
  const { openBooking } = useBooking();
  const list = services.length > 0 ? services : SERVICES_FALLBACK;

  return (
    <section className="section services" id="services">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">Прайс-лист · всегда открыт</p>
              <h2 className="section-title">
                Услуги и стоимость
              </h2>
            </div>
            <p className="section-head__sub">
              Цены фиксированы и не зависят от канала записи. Длительность
              указана для точного планирования слота в календаре.
            </p>
          </div>
        </Reveal>

        <div className="services__grid">
          <Reveal className="services__intro">
            <hr className="gold-rule" />
            <p>
              Студия принимает строго по предварительной записи — каждое время
              синхронизировано с календарём мастера в реальном времени.
            </p>
            <p className="micro">
              Имеются противопоказания. Необходима консультация специалиста.
              Услуги укрепления и донаращивания — для гостей {SITE.age}+.
            </p>
            <button className="btn btn--gold" onClick={() => openBooking()}>
              Выбрать время
            </button>
          </Reveal>

          <div className="services__list">
            {list.map((s, i) => (
              <Reveal key={s.id} delay={Math.min(i, 5) * 60}>
                <article className="price-row">
                  <div className="price-row__main">
                    <div className="price-row__name">
                      <h3>{s.name}</h3>
                      {s.popular && <span className="price-row__badge">хит</span>}
                    </div>
                    <div className="price-row__meta">
                      <span>{s.category}</span>
                      <span className="price-row__dot" />
                      <span>{s.durationMin} мин</span>
                    </div>
                  </div>
                  <div className="price-row__leader" />
                  <div className="price-row__price">{formatPrice(s.price)}</div>
                  <button
                    className="price-row__book"
                    onClick={() => openBooking(s.id)}
                    aria-label={`Записаться: ${s.name}`}
                  >
                    записаться
                  </button>
                  {s.note && <p className="price-row__note">{s.note}</p>}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
