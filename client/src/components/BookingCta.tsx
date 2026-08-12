import { useBooking } from '../context/BookingContext';
import { MacroArt } from './art/MacroArt';
import { Reveal } from '../lib/hooks';

export function BookingCta() {
  const { openBooking } = useBooking();
  return (
    <section className="section booking-cta">
      <div className="container">
        <Reveal>
          <div className="booking-cta__panel">
            <div className="booking-cta__art">
              <MacroArt variant="french" tone="champagne" />
              <div className="booking-cta__veil" />
            </div>
            <div className="booking-cta__content">
              <p className="eyebrow">Онлайн-запись</p>
              <h2 className="booking-cta__title">
                Свободные окна — <em className="italic">в реальном времени</em>
              </h2>
              <p className="booking-cta__text">
                Модуль записи подключён к календарю мастера: занятые слоты
                мгновенно исчезают, как только событие появляется в календаре.
                Никаких «уточняйте у администратора».
              </p>
              <button className="btn btn--gold" onClick={() => openBooking()}>
                Выбрать время
              </button>
              <p className="booking-cta__meta micro">
                Подтверждение по Email/SMS · напоминание за 24 часа · перенос в Telegram
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
