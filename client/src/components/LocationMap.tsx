import { SITE } from '../lib/site';
import { Reveal } from '../lib/hooks';
import { IconTelegram, IconWhatsApp } from './icons';

export function LocationMap() {
  const embedParams = new URLSearchParams({
    ll: `${SITE.mapCoordinates.lon},${SITE.mapCoordinates.lat}`,
    z: '16',
    pt: `${SITE.mapCoordinates.lon},${SITE.mapCoordinates.lat},pm2rdm`,
    lang: 'ru_RU',
  });
  const embedUrl = `https://yandex.ru/map-widget/v1/?${embedParams.toString()}`;

  return (
    <section className="section location" id="location">
      <div className="container">
        <Reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">Адрес · Петропавловск-Камчатский</p>
              <h2 className="section-title">Как нас найти</h2>
            </div>
            <p className="section-head__sub">
              Студия работает строго по предварительной записи. Домофон: подъезд
              2, кнопка «SETA» — встретим на входе.
            </p>
          </div>
        </Reveal>

        <div className="location__grid">
          <Reveal className="location__map-wrap">
            <div className="location__map">
              <iframe
                src={embedUrl}
                title={`${SITE.brand} — ${SITE.addressShort} на Яндекс.Картах`}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a
              className="location__map-link"
              href={SITE.mapRouteUrl}
              target="_blank"
              rel="noreferrer"
            >
              Открыть на Яндекс.Картах
            </a>
          </Reveal>

          <Reveal className="location__info" delay={120}>
            <hr className="gold-rule" />
            <div className="location__row">
              <span className="caps">Адрес</span>
              <p className="location__value">{SITE.address}</p>
            </div>
            <div className="location__row">
              <span className="caps">Режим работы</span>
              <p className="location__value">{SITE.workHours}</p>
            </div>
            <div className="location__row">
              <span className="caps">Телефон</span>
              <a className="location__value location__link" href={SITE.phoneHref}>
                {SITE.phone}
              </a>
            </div>
            <div className="location__row">
              <span className="caps">Мессенджеры</span>
              <div className="location__chips">
                <a href={SITE.telegram} target="_blank" rel="noreferrer" className="location__chip">
                  <IconTelegram size={14} />
                  Telegram
                </a>
                <a href={SITE.whatsapp} target="_blank" rel="noreferrer" className="location__chip">
                  <IconWhatsApp size={14} />
                  WhatsApp
                </a>
              </div>
            </div>
            <a
              className="btn btn--gold location__route"
              href={SITE.mapRouteUrl}
              target="_blank"
              rel="noreferrer"
            >
              Построить маршрут
            </a>
            <p className="micro location__note">
              Парковка на прилегающей территории · вход с улицы Владивостокской.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
