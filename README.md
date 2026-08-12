# STUDIO SETA by Catherine

Премиальная студия маникюра — готовый концепт сайта с онлайн-записью,
синхронизированной с Google Calendar мастера в реальном времени.

Домен-заглушка: `studio-seta.ru`

- **Frontend**: React 18 + Vite + TypeScript, эстетика «минимализм + макро-съёмка + Vogue»
- **Backend**: Node.js (Express) + `googleapis`, OAuth 2.0 / Service Account, webhooks + SSE, Email/SMS-напоминания
- **Вход клиентов через Google**: «Войти через Google» (GIS) — имя/email клиента из его Google-аккаунта, приглашение в личный календарь клиента (attendee)
- **РФ-комплаенс**: ФЗ-152 /privacy, /terms-of-use, cookie-баннер, галочка согласия, реквизиты ИП, маркировка 16+

---

## Быстрый старт

```bash
npm install
npm run dev
```

Откроется:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

Тесты интеграционного потока (валидация, слоты/двойная запись, Google-событие с
attendee, Telegram-уведомления) — на встроенном `node:test`:

```bash
npm test
```

Без Google-креденшелов бэкенд работает в **демо-режиме** (файловый календарь),
поэтому весь сценарий записи работает «из коробки»: занятые слоты засеяны,
запись создаёт событие, повторное бронирование блокируется.

## Демо-превью

Превью развёрнуто в текущей сессии: `https://5173-f33112a1d036f885.monkeycode-ai.live`

## Что проверено (smoke-тесты)

| Сценарий | Результат |
| --- | --- |
| `GET /api/slots?date=…` | Свободные окна с учётом занятых блоков (10:00–20:00) |
| `POST /api/booking` | Создаёт запись + событие, слот исчезает из расписания |
| Двойная запись на тот же слот | `409` — слот занят |
| Запись без согласия ФЗ-152 | `400` — согласие обязательно |
| `POST /api/demo/busy` (имитация события мастера) | Слот мгновенно исчезает + SSE-событие `calendar-change` |
| `POST /api/booking/reminders/run` | Запуск 24-часовых напоминаний |
| `GET /api/slots/week` | 14 дней с `closed` (выходной / персональный день) и `fill` (0–1, занятость дня) |
| `POST /api/demo/closed` | День помечается «мастер не работает», исчезает из выбора + SSE |
| Виджет календаря в записи | Ячейки дат заливаются по мере занятости; выходные помечены «выходной» |
| Секция «Как нас найти» | Интерактивная Яндекс.Карта + адрес, режим, маршрут |
| `POST /api/booking` с email | Клиент добавляется attendee → Google шлёт приглашение в его календарь (`sendUpdates: all`) |
| `POST /api/auth/google` (id_token) | Верификация Google-аккаунта клиента → профиль (email, имя) |
| `npm test` | 16 unit-тестов: двойная запись, валидация, attendee, Telegram, Google-профиль |

## Структура

```
client/                 Vite + React (SPA)
  src/components/       Header, Hero, About, Services, Portfolio, Reviews,
                        BookingCta, ContactBar, LocationMap (Яндекс.Карты),
                        Footer, CookieBanner, SearchOverlay, BookingModal,
                        AvailabilityCalendar (сетка занятости), art/MacroArt
  src/pages/            Home, Privacy, TermsOfUse
  src/styles/           токены, базовые стили, секции, модалка, адаптив
server/                 Express API
  src/routes/           slots, booking, oauth, webhook, services, status, demo
  src/services/         calendar (Google OAuth/SA/Demo), slots (алгоритм +
                        выходные/fill), notifications (Email/Telegram), reminders
  src/lib/              storage (файловый), SSE-хаб
```

## Документация

- `docs/ARCHITECTURE.md` — архитектура, сценарий записи, API
- `docs/GOOGLE_CALENDAR_SETUP.md` — пошаговая настройка Google OAuth 2.0 + webhook
- `docs/PHOTO_BRIEF.md` — фото-бриф для наполнения (WebP, 1920×1080 и т.д.)
- `docs/RF_COMPLIANCE.md` — чек-лист соответствия законам РФ
