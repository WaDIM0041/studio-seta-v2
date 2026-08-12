import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { ServiceDef } from '../lib/api';
import { useBooking } from '../context/BookingContext';
import { useEscapeKey, useLockBodyScroll } from '../lib/hooks';
import { IconArrowRight, IconClose, IconSearch } from './icons';

export function SearchOverlay({
  open,
  onClose,
  services,
}: {
  open: boolean;
  onClose: () => void;
  services: ServiceDef[];
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { openBooking } = useBooking();

  useLockBodyScroll(open);
  useEscapeKey(open, onClose);

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return services
      .filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [query, services]);

  if (!open) return null;

  return (
    <div className="search" role="dialog" aria-modal="true" aria-label="Поиск">
      <div className="search__bar">
        <IconSearch size={20} className="search__icon" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск услуг, категорий…"
          className="search__input"
          aria-label="Поиск по сайту"
        />
        <button className="search__close" onClick={onClose} aria-label="Закрыть поиск">
          <IconClose size={20} />
        </button>
      </div>

      <div className="search__results">
        {query.length === 0 && (
          <p className="search__hint">
            Введите название услуги — например, «Hard Gel» или «френч».
          </p>
        )}
        {query.length > 0 && results.length === 0 && (
          <p className="search__hint">Ничего не найдено. Напишите нам в Telegram — подберём услугу.</p>
        )}
        {results.map((s) => (
          <button
            key={s.id}
            className="search__result"
            onClick={() => {
              onClose();
              openBooking(s.id);
            }}
          >
            <span>
              <span className="search__result-name">{s.name}</span>
              <span className="search__result-cat">{s.category} · {s.durationMin} мин</span>
            </span>
            <span className="search__result-price">{s.price.toLocaleString('ru-RU')} ₽</span>
            <IconArrowRight size={16} />
          </button>
        ))}
        <button
          className="search__cta"
          onClick={() => {
            onClose();
            navigate('/');
            setTimeout(() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }), 80);
          }}
        >
          Смотреть все работы →
        </button>
      </div>
    </div>
  );
}
