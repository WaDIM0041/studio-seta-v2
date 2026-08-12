import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getCookieConsent,
  setCookieConsent,
  type CookieConsent,
} from '../lib/hooks';
import { IconClose } from './icons';

export function CookieBanner() {
  const [consent, setConsent] = useState<CookieConsent | null>(() => getCookieConsent());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false, marketing: false });

  if (consent) return null;

  const save = (next: { analytics: boolean; marketing: boolean }): void => {
    const record: CookieConsent = {
      essential: true,
      analytics: next.analytics,
      marketing: next.marketing,
      at: new Date().toISOString(),
    };
    setCookieConsent(record);
    setConsent(record);
  };

  return (
    <div className="cookie" role="dialog" aria-label="Настройка файлов cookie">
      <div className="cookie__inner">
        {!settingsOpen ? (
          <>
            <div className="cookie__text">
              <p className="cookie__title">Мы уважаем ваши данные</p>
              <p>
                Сайт использует файлы cookie и обрабатывает персональные данные
                в соответствии с{' '}
                <Link to="/privacy" className="cookie__link">
                  Политикой конфиденциальности
                </Link>
                . Технические cookie необходимы для работы онлайн-записи.
              </p>
            </div>
            <div className="cookie__actions">
              <button className="btn btn--gold btn--sm" onClick={() => save({ analytics: true, marketing: true })}>
                Принять все
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => setSettingsOpen(true)}>
                Настройки
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="cookie__text">
              <p className="cookie__title">Настройки cookie</p>
              <label className="cookie__row">
                <span>
                  <strong>Необходимые</strong>
                  <br />
                  <span className="micro">Работа онлайн-записи, сессия.</span>
                </span>
                <input type="checkbox" checked disabled />
              </label>
              <label className="cookie__row">
                <span>
                  <strong>Аналитика</strong>
                  <br />
                  <span className="micro">Анонимная статистика посещений.</span>
                </span>
                <input
                  type="checkbox"
                  checked={prefs.analytics}
                  onChange={(e) => setPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                />
              </label>
              <label className="cookie__row">
                <span>
                  <strong>Маркетинг</strong>
                  <br />
                  <span className="micro">Персонализированные предложения.</span>
                </span>
                <input
                  type="checkbox"
                  checked={prefs.marketing}
                  onChange={(e) => setPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                />
              </label>
            </div>
            <div className="cookie__actions">
              <button className="btn btn--gold btn--sm" onClick={() => save(prefs)}>
                Сохранить выбор
              </button>
              <button className="btn btn--ghost btn--sm" onClick={() => save({ analytics: false, marketing: false })}>
                Только необходимые
              </button>
            </div>
            <button className="cookie__close" aria-label="Закрыть" onClick={() => setSettingsOpen(false)}>
              <IconClose size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
