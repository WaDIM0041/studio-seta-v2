import { Link } from 'react-router-dom';
import { SITE, LEGAL } from '../lib/site';
import { useBooking } from '../context/BookingContext';
import {
  IconInstagram,
  IconTelegram,
  IconVk,
  IconWhatsApp,
} from './icons';

const NAV = [
  { label: 'Услуги и цены', id: 'services' },
  { label: 'Работы', id: 'portfolio' },
  { label: 'Отзывы', id: 'reviews' },
  { label: 'Контакты', id: 'contacts' },
];

export function Footer() {
  const { openBooking } = useBooking();

  const scrollTo = (id: string): void => {
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <span className="brand__mark footer__mark">
              <em>S</em>ETA
            </span>
            <p className="footer__tagline">
              Премиальная студия маникюра.
              <br />
              Архитектура формы. Безупречный срез.
            </p>
            <div className="footer__socials">
              <a href={SITE.vk} target="_blank" rel="noreferrer" aria-label="VK группа">
                <IconVk size={17} />
              </a>
              <a href={SITE.telegram} target="_blank" rel="noreferrer" aria-label="Telegram">
                <IconTelegram size={17} />
              </a>
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                <IconInstagram size={17} />
              </a>
              <a href={SITE.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp">
                <IconWhatsApp size={17} />
              </a>
            </div>
          </div>

          <div className="footer__col">
            <p className="caps footer__heading">Разделы</p>
            {NAV.map((n) => (
              <button key={n.id} className="footer__link" onClick={() => scrollTo(n.id)}>
                {n.label}
              </button>
            ))}
            <button className="footer__link" onClick={() => openBooking()}>
              Онлайн-запись
            </button>
          </div>

          <div className="footer__col">
            <p className="caps footer__heading">Документы</p>
            <Link to="/privacy" className="footer__link">
              Политика конфиденциальности (ФЗ-152)
            </Link>
            <Link to="/terms-of-use" className="footer__link">
              Пользовательское соглашение
            </Link>
            <a href={SITE.telegram} target="_blank" rel="noreferrer" className="footer__link">
              Telegram · {SITE.telegramHandle}
            </a>
            <span className="footer__insta-note">
              Instagram — {SITE.instagramHandle}
              <br />
              <span className="micro">
                доступ к Instagram может быть ограничен на территории РФ
              </span>
            </span>
          </div>

          <div className="footer__col">
            <p className="caps footer__heading">Адрес и режим</p>
            <p className="footer__text">{SITE.address}</p>
            <p className="footer__text">{SITE.workHours}</p>
            <a className="footer__link" href={SITE.phoneHref}>
              {SITE.phone}
            </a>
            <a className="footer__link" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </div>
        </div>

        <div className="footer__legal">
          <p className="footer__requisites">
            {LEGAL.ipName} · {LEGAL.inn} · {LEGAL.ogrnip}
          </p>
          <div className="footer__legal-row">
            <span>© {new Date().getFullYear()} STUDIO SETA by Catherine · {SITE.domain}</span>
            <span>Сайт не является публичной офертой</span>
            <span className="footer__creator">
              Создание сайта: 
              <a 
                href="https://annakam.ru" 
                target="_blank" 
                rel="noreferrer" 
                className="ak-logo-link"
              >
                <span className="ak-logo-hex-wrapper">
                  <svg viewBox="0 0 40 44" className="ak-logo-hex-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="ak-hex-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0df2b7" />
                        <stop offset="50%" stopColor="#0ba6ff" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                    <polygon 
                      points="20,2 38,12 38,32 20,42 2,32 2,12" 
                      className="ak-hex-outer"
                    />
                    <polygon 
                      points="20,6 34.5,14.5 34.5,29.5 20,38 5.5,29.5 5.5,14.5" 
                      className="ak-hex-middle"
                    />
                    <polygon 
                      points="20,10 31,16.5 31,27.5 20,34 9,27.5 9,16.5" 
                      className="ak-hex-inner"
                    />
                    <text 
                      x="20" 
                      y="25.5" 
                      textAnchor="middle" 
                      className="ak-hex-text"
                    >
                      AK
                    </text>
                  </svg>
                </span>
                <span className="ak-logo-text-wrapper">
                  <span className="ak-logo-brand-name">ANNA KAMCHATKA</span>
                  <span className="ak-logo-domain">annakam.ru</span>
                </span>
              </a>
            </span>
            <span>Возрастная маркировка {SITE.age}</span>
            <span>Имеются противопоказания</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
