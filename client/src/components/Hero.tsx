import { SITE } from '../lib/site';
import { useBooking } from '../context/BookingContext';
import { MacroArt } from './art/MacroArt';
import { IconArrowRight } from './icons';
import { Reveal } from '../lib/hooks';

export function Hero() {
  const { openBooking } = useBooking();

  return (
    <section className="hero" id="top">
      <div className="hero__art">
        <MacroArt variant="droplet" tone="graphite" />
        <div className="hero__art-veil" />
      </div>

      <div className="container hero__inner">
        <Reveal delay={100}>
          <p className="hero__eyebrow">
            {SITE.city} · студия маникюра премиум-класса · запись онлайн
          </p>
        </Reveal>
        <Reveal delay={200}>
          <h1 className="display hero__title">
            Архитектура <em className="italic">формы.</em>
            <br />
            Безупречный срез
          </h1>
        </Reveal>
        <Reveal delay={300}>
          <p className="hero__sub">
            Маникюр и педикюр уровня журнальной съёмки: макро-чистота, строгий
            гель-ландшафт и золотая детализация — в приватной студии по записи.
          </p>
        </Reveal>
        <Reveal delay={400}>
          <div className="hero__cta">
            <button className="btn btn--gold" onClick={() => openBooking()}>
              Выбрать время
              <IconArrowRight size={16} />
            </button>
            <a href="#portfolio" className="btn btn--ghost">
              Смотреть работы
            </a>
          </div>
        </Reveal>
      </div>

      <Reveal delay={500} className="hero__meta">
        <div>
          <span className="caps">Режим</span>
          <span className="hero__meta-value">{SITE.workHours}</span>
        </div>
        <div>
          <span className="caps">Локация</span>
          <span className="hero__meta-value">Владивостокская, 1</span>
        </div>
        <div>
          <span className="caps">Возраст</span>
          <span className="hero__meta-value">{SITE.age}</span>
        </div>
        <div>
          <span className="caps">Статус</span>
          <span className="hero__meta-value hero__meta-live">
            <span className="hero__live-dot" /> календарь онлайн
          </span>
        </div>
      </Reveal>

      <div className="hero__scroll" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
