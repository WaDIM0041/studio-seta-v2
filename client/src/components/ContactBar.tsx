import { SITE } from '../lib/site';
import { useBooking } from '../context/BookingContext';
import { Reveal } from '../lib/hooks';
import { IconTelegram, IconWhatsApp, IconInstagram } from './icons';

export function ContactBar() {
  const { openBooking } = useBooking();

  return (
    <section className="section contact-bar" id="contacts">
      <div className="container">
        <Reveal>
          <div className="contact-bar__panel">
            <div className="contact-bar__copy">
              <p className="eyebrow">Связь</p>
              <h2 className="contact-bar__title">Остались вопросы? Напишите нам</h2>
              <p className="contact-bar__text">
                Поможем подобрать услугу, перенесём запись или ответим про уход.
                Обычно отвечаем в течение 30 минут в рабочее время.
              </p>
            </div>
            <div className="contact-bar__actions">
              <a href={SITE.telegram} target="_blank" rel="noreferrer" className="btn btn--gold">
                <IconTelegram size={16} />
                Telegram {SITE.telegramHandle}
              </a>
              <a href={SITE.whatsapp} target="_blank" rel="noreferrer" className="btn btn--ghost">
                <IconWhatsApp size={16} />
                WhatsApp
              </a>
              <a href={SITE.instagram} target="_blank" rel="noreferrer" className="btn btn--ghost">
                <IconInstagram size={16} />
                Instagram @{SITE.instagramHandle}
              </a>
              <button className="contact-bar__link" onClick={() => openBooking()}>
                или запишитесь онлайн →
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
