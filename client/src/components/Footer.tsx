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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              Создание сайта: 
              <a href="https://annakam.ru" target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: 'var(--gold-soft)' }}>
                <svg viewBox="0 0 30 30" width="15" height="15" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block' }}>
                  <path fill="#1a1a1c" stroke="#d4af37" strokeWidth="0.63" d="M24.51,28.51H5.49c-2.21,0-4-1.79-4-4V5.49c0-2.21,1.79-4,4-4h19.03c2.21,0,4,1.79,4,4v19.03C28.51,26.72,26.72,28.51,24.51,28.51z"/>
                  <g style={{ fill: 'var(--gold-soft)' }}>
                    <path fill="currentColor" d="M15.47,7.1l-1.3,1.85c-0.2,0.29-0.54,0.47-0.9,0.47h-7.1V7.09C6.16,7.1,15.47,7.1,15.47,7.1z"/>
                    <polygon fill="currentColor" points="24.3,7.1 13.14,22.91 5.7,22.91 16.86,7.1"/>
                    <path fill="currentColor" d="M14.53,22.91l1.31-1.86c0.2-0.29,0.54-0.47,0.9-0.47h7.09v2.33H14.53z"/>
                  </g>
                </svg>
                <span style={{ textDecoration: 'underline' }}>AK annakam.ru</span>
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
