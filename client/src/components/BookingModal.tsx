import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  api,
  type BookingResult,
  type DayInfo,
  type GoogleProfile,
  type ServiceDef,
  type SlotsResponse,
  subscribeCalendarEvents,
} from '../lib/api';
import { useEscapeKey, useLockBodyScroll } from '../lib/hooks';
import { SITE } from '../lib/site';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { GoogleSignIn } from './GoogleSignIn';
import {
  IconArrowRight,
  IconCalendar,
  IconCheck,
  IconClose,
} from './icons';

const FALLBACK_SERVICES: ServiceDef[] = [
  { id: 'comb-manicure', name: 'Маникюр комби', price: 2200, durationMin: 90, category: 'Маникюр' },
  { id: 'hard-gel', name: 'Укрепление Hard Gel', price: 2600, durationMin: 120, category: 'Маникюр' },
  { id: 'extension', name: 'Донаращивание', price: 1800, durationMin: 90, category: 'Маникюр' },
  { id: 'gel-polish', name: 'Покрытие гель-лак', price: 800, durationMin: 45, category: 'Маникюр' },
  { id: 'design', name: 'Дизайн ногтей', price: 500, durationMin: 30, category: 'Дизайн' },
  { id: 'art-sculpt', name: 'Авторский дизайн SETA Art', price: 1500, durationMin: 60, category: 'Дизайн' },
  { id: 'pedicure', name: 'Педикюр аппаратный', price: 3000, durationMin: 120, category: 'Педикюр' },
  { id: 'removal', name: 'Снятие покрытия', price: 400, durationMin: 20, category: 'Уход' },
];

type Step = 'service' | 'datetime' | 'form' | 'success';

const STEPS: Array<{ key: Step; label: string }> = [
  { key: 'service', label: 'Услуга' },
  { key: 'datetime', label: 'Время' },
  { key: 'form', label: 'Данные' },
];

export function BookingModal({
  isOpen,
  onClose,
  preselectServiceId,
}: {
  isOpen: boolean;
  onClose: () => void;
  preselectServiceId?: string;
}) {
  const [step, setStep] = useState<Step>('service');
  const [services, setServices] = useState<ServiceDef[]>(FALLBACK_SERVICES);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [days, setDays] = useState<DayInfo[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<SlotsResponse | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [realtimeOn, setRealtimeOn] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingResult['booking'] | null>(null);

  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [consent, setConsent] = useState(false);
  const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(null);

  const initialServiceRef = useRef(preselectServiceId);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useLockBodyScroll(isOpen);
  useEscapeKey(isOpen, onClose);

  const open = useCallback(() => {
    setError('');
    setNotice('');
    setResult(null);
    setTime(null);
    setClientName('');
    setPhone('');
    setEmail('');
    setComment('');
    setConsent(false);
    setGoogleProfile(null);
    if (initialServiceRef.current) {
      setServiceId(initialServiceRef.current);
      setStep('datetime');
    } else {
      setStep('service');
    }
    void api
      .services()
      .then((r) => setServices(r.services))
      .catch(() => setServices(FALLBACK_SERVICES));
  }, []);

  useEffect(() => {
    if (isOpen) open();
  }, [isOpen, open]);

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId) || null,
    [services, serviceId],
  );

  // Fetch the 14-day availability grid.
  useEffect(() => {
    if (!isOpen || !serviceId) return;
    let cancelled = false;
    setLoading(true);
    void api
      .week(serviceId, new Date().toISOString().slice(0, 10))
      .then((r) => {
        if (!cancelled) setDays(r.days);
      })
      .catch(() => setDays([]))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, serviceId]);

  // Load slots for the selected date.
  const loadSlots = useCallback(
    async (d: string, silent = false) => {
      if (!serviceId) return;
      if (!silent) setLoading(true);
      try {
        const data = await api.slots(d, serviceId);
        setSlots(data);
        setTime(null);
        setError('');
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Не удалось загрузить расписание');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [serviceId],
  );

  useEffect(() => {
    if (isOpen && serviceId && date) {
      void loadSlots(date, true);
    }
  }, [isOpen, serviceId, date, loadSlots]);

  // Real-time sync: SSE + 30s polling while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const refresh = (): void => {
      if (serviceId && date) {
        void loadSlots(date, true);
        setNotice('Расписание обновлено');
        setTimeout(() => setNotice(''), 3000);
      }
    };
    const unsub = subscribeCalendarEvents(refresh);
    pollRef.current = setInterval(refresh, 30_000);
    return () => {
      unsub();
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isOpen, serviceId, date, loadSlots]);

  useEffect(() => {
    setRealtimeOn(isOpen && Boolean(serviceId));
  }, [isOpen, serviceId]);

  const pickService = (id: string): void => {
    setServiceId(id);
    setStep('datetime');
  };

  const pickDate = (d: string): void => {
    setDate(d);
  };

  const handleGoogleProfile = useCallback((profile: GoogleProfile) => {
    setGoogleProfile(profile);
    setError('');
    setClientName((prev) => prev.trim() || profile.name);
    setEmail(profile.email);
  }, []);

  const submit = async (): Promise<void> => {
    if (!serviceId || !date || !time) return;
    if (clientName.trim().length < 2) {
      setError('Укажите имя');
      return;
    }
    if (!/^\+?\d{10,15}$/.test(phone.replace(/[\s()-]/g, ''))) {
      setError('Укажите корректный номер телефона');
      return;
    }
    if (!consent) {
      setError('Для записи необходимо согласие на обработку персональных данных');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.book({
        serviceId,
        date,
        time,
        clientName: clientName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        comment: comment.trim() || undefined,
        consent,
      });
      setResult(res.booking);
      setStep('success');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка записи';
      setError(message);
      if (e instanceof Error && 'status' in e && (e as { status: number }).status === 409) {
        // slot was taken meanwhile — reload realtime data
        if (serviceId && date) void loadSlots(date, true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const close = (): void => {
    setStep('service');
    onClose();
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className={`modal ${isOpen ? 'modal--open' : ''}`} role="dialog" aria-modal="true" aria-label="Онлайн-запись">
      <div className="modal__backdrop" onClick={close} />
      <div className="modal__panel">
        <header className="modal__head">
          <div className="modal__title-wrap">
            <p className="eyebrow">Онлайн-запись</p>
            <h3 className="modal__title">Выберите время</h3>
          </div>
          <div className="modal__head-right">
            {realtimeOn && (
              <span className="modal__live">
                <span className="hero__live-dot" /> синхронизация с календарём мастера
              </span>
            )}
            <button className="icon-btn" onClick={close} aria-label="Закрыть">
              <IconClose size={20} />
            </button>
          </div>
        </header>

        {step !== 'success' && (
          <div className="modal__steps" aria-hidden="true">
            {STEPS.map((s, i) => (
              <div key={s.key} className={`modal__step ${i === stepIndex ? 'modal__step--active' : ''} ${i < stepIndex ? 'modal__step--done' : ''}`}>
                <span className="modal__step-num">{i < stepIndex ? <IconCheck size={12} /> : i + 1}</span>
                <span className="modal__step-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="modal__body">
          {notice && <div className="modal__notice">{notice}</div>}
          {error && <div className="modal__error">{error}</div>}

          {step === 'service' && (
            <div className="booking-services">
              {services.map((s) => (
                <button key={s.id} className="booking-service" onClick={() => pickService(s.id)}>
                  <span className="booking-service__name">{s.name}</span>
                  <span className="booking-service__meta">
                    {s.category} · {s.durationMin} мин
                    {s.note && <em> · {s.note}</em>}
                  </span>
                  <span className="booking-service__price">{s.price.toLocaleString('ru-RU')} ₽</span>
                  <IconArrowRight size={16} className="booking-service__arrow" />
                </button>
              ))}
            </div>
          )}

          {step === 'datetime' && selectedService && (
            <div className="booking-datetime">
              <div className="booking-datetime__days">
                <p className="caps booking-label">Ближайшие 14 дней</p>
                {days.length === 0 && <p className="micro">Загрузка расписания…</p>}
                {days.length > 0 && (
                  <AvailabilityCalendar
                    days={days}
                    selectedDate={date}
                    onSelect={pickDate}
                  />
                )}
              </div>

              <div className="booking-datetime__slots">
                <div className="booking-slot-summary">
                  <div>
                    <p className="booking-label caps">{selectedService.name}</p>
                    <p className="booking-slot-summary__meta">
                      {selectedService.durationMin} мин · {selectedService.price.toLocaleString('ru-RU')} ₽
                      {date && slots ? ` · ${date}` : ''}
                    </p>
                  </div>
                  <button className="booking-slot-summary__change" onClick={() => setStep('service')}>
                    изменить
                  </button>
                </div>

                {slots && slots.busy.length > 0 && (
                  <div className="booking-busy">
                    <span className="caps booking-label">Занято мастером</span>
                    <div className="booking-busy__chips">
                      {slots.busy.map((b, i) => (
                        <span key={i} className="booking-busy__chip">
                          {b.start.slice(11, 16)}–{b.end.slice(11, 16)}
                        </span>
                      ))}
                    </div>
                    <p className="micro">Слоты исчезают мгновенно при изменении календаря мастера.</p>
                  </div>
                )}

                {slots?.closed && (
                  <div className="booking-closed">
                    <span className="caps">Мастер не работает</span>
                    <p className="micro">
                      {slots.closedReason === 'weekend'
                        ? 'Это выходной день студии.'
                        : 'У мастера персональный выходной.'}{' '}
                      Выберите другую дату.
                    </p>
                  </div>
                )}

                <div className="booking-slot-grid">
                  {loading && !slots && <p className="micro">Загружаем свободные окна…</p>}
                  {slots && slots.slots.length === 0 && (
                    <p className="micro">Свободных окон в этот день нет. Выберите другую дату.</p>
                  )}
                  {slots &&
                    slots.slots.map((s) => (
                      <button
                        key={s.time}
                        className={`slot-chip ${time === s.time ? 'slot-chip--active' : ''}`}
                        onClick={() => setTime(s.time)}
                      >
                        {s.time}
                      </button>
                    ))}
                </div>

                <div className="modal__footer">
                  <span className="micro">
                    Режим работы: {slots?.workHours.start ?? 10}:00–{slots?.workHours.end ?? 20}:00
                  </span>
                  <button
                    className="btn btn--gold"
                    disabled={!time}
                    onClick={() => setStep('form')}
                  >
                    Далее
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'form' && selectedService && date && time && (
            <div className="booking-form">
              <div className="booking-form__summary">
                <span className="caps">{selectedService.name}</span>
                <span className="booking-form__when">
                  <IconCalendar size={14} /> {date}, {time}–{slots?.slots.find((s) => s.time === time)?.end ?? ''}
                </span>
                <span className="booking-form__price">{selectedService.price.toLocaleString('ru-RU')} ₽</span>
              </div>

              {!googleProfile ? (
                <>
                  <div className="booking-form__divider">
                    <span className="booking-form__divider-line" />
                    <span className="caps">Войти через Google</span>
                    <span className="booking-form__divider-line" />
                  </div>
                  <GoogleSignIn onProfile={handleGoogleProfile} onError={setError} />
                  <div className="booking-form__divider">
                    <span className="booking-form__divider-line" />
                    <span className="caps">Или заполнить вручную</span>
                    <span className="booking-form__divider-line" />
                  </div>
                </>
              ) : (
                <div className="booking-google-ok">
                  {googleProfile.picture && (
                    <img
                      className="booking-google-ok__avatar"
                      src={googleProfile.picture}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="booking-google-ok__meta">
                    <span className="booking-google-ok__name">
                      {googleProfile.name || googleProfile.email}
                    </span>
                    <span className="micro">{googleProfile.email}</span>
                  </div>
                  <button
                    type="button"
                    className="booking-google-ok__switch"
                    onClick={() => setGoogleProfile(null)}
                  >
                    сменить аккаунт
                  </button>
                </div>
              )}

              <label className="field">
                <span className="field__label">Имя</span>
                <input
                  className="field__input"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Как к вам обращаться"
                  autoComplete="name"
                />
              </label>

              <label className="field">
                <span className="field__label">Телефон</span>
                <input
                  className="field__input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="field">
                <span className="field__label">
                  Email{' '}
                  <em className="field__opt">
                    {googleProfile ? 'из Google-аккаунта' : 'необязательно'}
                  </em>
                </span>
                <input
                  className="field__input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="для подтверждения записи"
                  type="email"
                  autoComplete="email"
                  readOnly={Boolean(googleProfile)}
                />
                {googleProfile && (
                  <p className="micro booking-google-hint">
                    Приглашение от Google придёт на этот адрес — запись появится в
                    вашем личном календаре.
                  </p>
                )}
              </label>

              <label className="field">
                <span className="field__label">Комментарий <em className="field__opt">необязательно</em></span>
                <textarea
                  className="field__input field__input--area"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                  placeholder="Пожелания к дизайну, аллергии…"
                />
              </label>

              <label className="consent">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                <span>
                  Нажимая кнопку, вы даёте согласие на обработку персональных
                  данных согласно{' '}
                  <Link to="/privacy" onClick={close} className="cookie__link">
                    Политике конфиденциальности
                  </Link>
                  .
                </span>
              </label>

              <div className="modal__footer">
                <button className="btn btn--ghost" onClick={() => setStep('datetime')}>
                  Назад
                </button>
                <button className="btn btn--gold" onClick={() => void submit()} disabled={submitting}>
                  {submitting ? 'Отправляем…' : 'Подтвердить запись'}
                </button>
              </div>
              <p className="modal__micro">
                После подтверждения создадим событие «[Имя] | Услуга» в календаре
                мастера. За 24 часа пришлём напоминание по Email/SMS.
              </p>
            </div>
          )}

          {step === 'success' && result && (
            <div className="booking-success">
              <div className="booking-success__mark">
                <IconCheck size={26} />
              </div>
              <h4 className="booking-success__title">Запись подтверждена</h4>
              <div className="booking-success__card">
                <span className="caps">{result.serviceName}</span>
                <span className="booking-success__when">
                  {new Date(result.start).toLocaleString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    timeZone: 'Europe/Moscow',
                  })}{' '}
                  ·{' '}
                  {new Date(result.start).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'Europe/Moscow',
                  })}
                </span>
                <span className="booking-success__price">{result.price.toLocaleString('ru-RU')} ₽</span>
                <span className="micro">Номер записи: SETA-{result.id.toUpperCase()}</span>
              </div>
              <p className="booking-success__note">
                Подтверждение и напоминание за 24 часа придут на ваш email или SMS.
                Если передумаете — напишите в{' '}
                <a href={SITE.telegram} target="_blank" rel="noreferrer" className="cookie__link">
                  Telegram {SITE.telegramHandle}
                </a>
                .
              </p>
              <div className="modal__footer modal__footer--center">
                <button className="btn btn--gold" onClick={close}>
                  Готово
                </button>
              </div>
            </div>
          )}

          {step === 'form' && !time && (
            <p className="micro">Вернитесь к выбору времени.</p>
          )}
        </div>
      </div>
    </div>
  );
}
