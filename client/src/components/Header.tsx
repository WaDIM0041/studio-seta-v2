import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SITE } from '../lib/site';
import { useBooking } from '../context/BookingContext';
import {
  IconClose,
  IconMenu,
  IconSearch,
  IconTelegram,
  IconVk,
} from './icons';

export function Header({ onOpenSearch }: { onOpenSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { openBooking } = useBooking();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const scrollTo = (id: string): void => {
    setMenuOpen(false);
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className={`header ${scrolled || menuOpen ? 'header--solid' : ''}`}>
        <div className="container header__inner">
          <Link to="/" className="brand" aria-label="STUDIO SETA — на главную">
            <span className="brand__mark">
              <em>S</em>ETA
            </span>
            <span className="brand__sub">
              STUDIO&nbsp;SETA <span className="brand__dot">·</span> by&nbsp;Catherine
            </span>
          </Link>

          <nav className="header__nav" aria-label="Основная навигация">
            <button onClick={() => scrollTo('services')} className="header__nav-link">
              Услуги и цены
            </button>
            <button onClick={() => scrollTo('portfolio')} className="header__nav-link">
              Работы
            </button>
            <button onClick={() => scrollTo('reviews')} className="header__nav-link">
              Отзывы
            </button>
            <button onClick={() => scrollTo('contacts')} className="header__nav-link">
              Контакты
            </button>
          </nav>

          <div className="header__actions">
            <button className="btn btn--gold btn--sm header__cta" onClick={() => openBooking()}>
              Онлайн-запись
            </button>
            <div className="header__socials">
              <a
                href={SITE.vk}
                target="_blank"
                rel="noreferrer"
                aria-label="VK группа"
                className="icon-btn"
              >
                <IconVk size={18} />
              </a>
              <a
                href={SITE.telegram}
                target="_blank"
                rel="noreferrer"
                aria-label="Telegram"
                className="icon-btn"
              >
                <IconTelegram size={18} />
              </a>
              <button aria-label="Поиск по сайту" className="icon-btn" onClick={onOpenSearch}>
                <IconSearch size={18} />
              </button>
            </div>
            <button
              className="header__burger"
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`drawer ${menuOpen ? 'drawer--open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="drawer__nav">
          <button onClick={() => scrollTo('services')}>Услуги и цены</button>
          <button onClick={() => scrollTo('portfolio')}>Работы</button>
          <button onClick={() => scrollTo('reviews')}>Отзывы</button>
          <button onClick={() => scrollTo('contacts')}>Контакты</button>
          <Link to="/privacy" onClick={() => setMenuOpen(false)}>
            Политика конфиденциальности
          </Link>
          <Link to="/terms-of-use" onClick={() => setMenuOpen(false)}>
            Пользовательское соглашение
          </Link>
        </nav>
        <button className="btn btn--gold btn--block" onClick={() => { setMenuOpen(false); openBooking(); }}>
          Онлайн-запись
        </button>
        <div className="drawer__socials">
          <a href={SITE.telegram} target="_blank" rel="noreferrer">
            Telegram · {SITE.telegramHandle}
          </a>
          <a href={SITE.vk} target="_blank" rel="noreferrer">
            VK
          </a>
        </div>
      </div>
    </>
  );
}
