import { useCallback, useEffect, useRef, useState } from 'react';
import { MacroArt, type Tone, type Variant } from './art/MacroArt';
import { Reveal } from '../lib/hooks';
import { IconChevronLeft, IconChevronRight } from './icons';

interface Review {
  id: number;
  name: string;
  service: string;
  date: string;
  text: string;
  tone: Tone;
  variant: Variant;
}

const REVIEWS: Review[] = [
  {
    id: 1,
    name: 'Анастасия',
    service: 'Маникюр комби + Hard Gel',
    date: 'май 2026',
    tone: 'graphite',
    variant: 'french',
    text: 'Срез идеальный — ни одной заусеницы. Кабинет как обложка журнала, а руки после процедуры выглядят как на рекламе Vogue. Записалась через сайт, время было прямо в календаре.',
  },
  {
    id: 2,
    name: 'Мария',
    service: 'Укрепление + авторский дизайн',
    date: 'июнь 2026',
    tone: 'champagne',
    variant: 'rings',
    text: 'Увидела работы в портфолио и влюбилась в эстетику. Мастер очень аккуратная, ни одной капли мимо. Покрытие держится уже третью неделю как новое.',
  },
  {
    id: 3,
    name: 'Елена',
    service: 'Педикюр аппаратный',
    date: 'июль 2026',
    tone: 'bone',
    variant: 'droplet',
    text: 'Наконец-то студия, где цены открыты и слоты реальные — не нужно писать в личку, чтобы узнать стоимость. Напоминание пришло за сутки, очень удобно.',
  },
  {
    id: 4,
    name: 'Дарья',
    service: 'Классический френч',
    date: 'июль 2026',
    tone: 'noir',
    variant: 'french',
    text: 'Френч как с подиума — тонкая линия, зеркальный блик. Блиц-съёмка в студии после процедуры — это отдельная магия. Рекомендую всем, кто ценит детали.',
  },
  {
    id: 5,
    name: 'Ольга',
    service: 'Маникюр комби',
    date: 'август 2026',
    tone: 'rose',
    variant: 'rings',
    text: 'Очень женственно и стильно. Атмосфера приватная, без очередей. Перенесла запись через Telegram за час до визита — без проблем и штрафов.',
  },
];

export function Reviews() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = REVIEWS.length;

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + total) % total),
    [total],
  );

  useEffect(() => {
    if (paused) return;
    timer.current = setInterval(() => go(1), 6000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [go, paused]);

  return (
    <section className="section reviews" id="reviews">      <div className="container">
        <Reveal>
          <div className="section-head">
            <div>
              <p className="eyebrow">Отзывы · до / после</p>
              <h2 className="section-title">Мнение гостей</h2>
            </div>
            <div className="reviews__arrows">
              <button className="icon-btn icon-btn--lg" onClick={() => go(-1)} aria-label="Предыдущий отзыв">
                <IconChevronLeft />
              </button>
              <button className="icon-btn icon-btn--lg" onClick={() => go(1)} aria-label="Следующий отзыв">
                <IconChevronRight />
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div
            className="reviews__viewport"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {REVIEWS.map((item, i) => (
              <article
                key={item.id}
                className={`review-card ${i === index ? 'review-card--active' : ''}`}
                aria-hidden={i !== index}
              >
                <div className="review-card__media">
                  <div className="review-card__pair">
                    <div className="review-card__frame review-card__frame--before">
                      <span className="review-card__tag">до</span>
                      <MacroArt variant={item.variant} tone="noir" />
                    </div>
                    <div className="review-card__frame review-card__frame--after">
                      <span className="review-card__tag review-card__tag--gold">после</span>
                      <MacroArt variant={item.variant} tone={item.tone} />
                    </div>
                  </div>
                </div>
                <div className="review-card__body">
                  <blockquote>«{item.text}»</blockquote>
                  <footer className="review-card__meta">
                    <span className="review-card__name">{item.name}</span>
                    <span className="review-card__dot" />
                    <span>{item.service}</span>
                    <span className="review-card__dot" />
                    <span className="muted">{item.date}</span>
                  </footer>
                </div>
              </article>
            ))}
          </div>
        </Reveal>

        <div className="reviews__dots" role="tablist" aria-label="Навигация по отзывам">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === index ? 'dot--active' : ''}`}
              onClick={() => setIndex(i)}
              aria-label={`Отзыв ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
