# Архитектура

## Компоненты

```
┌─────────────────────┐      /api (Vite proxy)      ┌──────────────────────────┐
│  Client (React+Vite)│ ──────────────────────────► │  Server (Express :3001)  │
│  BookingModal       │  ◄────────── SSE ────────── │  SSE-хаб                 │
└─────────────────────┘                             └───────────┬──────────────┘
                                                                │
                                     ┌──────────────────────────┼─────────────────────┐
                                     ▼                          ▼                     ▼
                              ┌───────────────┐          ┌───────────────┐    ┌───────────────┐
                              │ GoogleCalendar│          │  Slot Engine  │    │ Notifications │
                              │  (OAuth/SA)   │          │   (slots.ts)  │    │  Email/Telegram│
                              └───────┬───────┘          └───────────────┘    └───────┬───────┘
                                      │ freebusy / insert                          │
                              ┌───────▼───────┐                                      ▼
                              │  Google API   │                               Reminder loop
                              │  + webhook    │                               (24h до визита)
                              └───────────────┘
```

## Ключевой сценарий: онлайн-запись

1. Клиент открывает модалку записи (`BookingModal`) → грузится 14-дневная сетка
   доступности `GET /api/slots/week`.
2. Выбирается услуга (длительность влияет на алгоритм слотов) и дата →
   `GET /api/slots?date=YYYY-MM-DD&serviceId=…`.
3. **Алгоритм свободных окон** (`server/src/services/slots.ts`):
   - рабочее окно 10:00–20:00 (Europe/Moscow);
   - `calendar.getBusy()` берёт из Google `freebusy.query` занятые интервалы;
   - стартовое время допустимо, если вся длительность услуги помещается до
     начала ближайшего занятого блока (и до 20:00);
   - шаг сетки 30 минут. Пример: запись 12:00–14:00 → предложатся 10:00, 10:30,
     14:00, 14:30, 16:00 …
4. Клиент заполняет форму. Обязательно согласие ФЗ-152 (галочка).
5. `POST /api/booking` **повторно валидирует слот** по живому календарю —
   защита от двойной записи (409, если слот только что заняли).
6. Создаётся событие `[Имя клиента] | Услуга` в Primary-календаре, в локальное
   хранилище пишется запись, клиенту уходит подтверждение (Email или SMS/Telegram),
   владельцу — уведомление в Telegram.
7. Клиент видит экран подтверждения; слот исчезает у всех подключённых клиентов.

## Real-time синхронизация (webhooks + SSE)

- **Google → сайт**: `calendar.events.watch` создаёт push-канал на
  `PUBLIC_BASE_URL/api/webhook/calendar`. Любое изменение календаря мастера
  (он добавил/изменил событие вручную) приходит POST'ом → инвалидируется кэш
  свободных окон → SSE-событие `calendar-change` → у всех открытых модалок
  слот исчезает.
- **Резерв**: пока модалка открыта, клиент также опрашивает слоты раз в 30 секунд.
- **Booking → сайт**: после записи транслируется SSE-событие `booking`.

> Важно: Google доставляет webhook только на публичный HTTPS. В разработке с
> локальным сервером webhook недоступен — используйте демо-режим или проброс
> PUBLIC_BASE_URL на публичный адрес. В демо-режиме «изменение календаря мастера»
> имитируется через `POST /api/demo/busy`.

## Провайдеры календаря (`server/src/services/calendar.ts`)

Приоритет выбора:

1. `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` — Service Account (JWT).
2. `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` — OAuth 2.0 владельца (Primary).
3. Иначе — `DemoCalendarProvider` (файловое хранилище).

## Уведомления

- **Подтверждение записи**: Email (nodemailer, SMTP из env) или Telegram/SMS-заглушка.
- **Напоминание за 24 часа**: `startReminderLoop()` каждые 10 минут находит
  подтверждённые записи с «осталось 20–24 часа» и шлёт Email/SMS, затем
  помечает `remindedAt`, чтобы не дублировать.
- **Владельцу**: уведомление о новой записи в Telegram (`TELEGRAM_BOT_TOKEN`).

## Хранилище

Файловое JSON в `server/.data` (не в git):

- `google-tokens.json` — токены OAuth;
- `bookings.json` — подтверждённые записи;
- `demo-busy.json` — занятые слоты демо-режима.

Для продакшена замените на PostgreSQL/Redis без изменения контракта
(`storage` — единственная точка доступа).

## API-эндпоинты

| Метод | Путь | Назначение |
| --- | --- | --- |
| GET | `/api/health` | Проверка живости |
| GET | `/api/status` | Состояние, провайдер, uptime |
| GET | `/api/services` | Публичный прайс |
| GET | `/api/slots/week` | Доступность на 14 дней |
| GET | `/api/slots?date&serviceId` | Свободные окна на дату |
| POST | `/api/booking` | Создание записи |
| GET | `/api/events/stream` | SSE: `calendar-change`, `booking` |
| GET | `/api/oauth/status` | Статус подключения Google |
| GET | `/api/oauth/url` | URL авторизации OAuth 2.0 |
| GET | `/api/oauth/callback` | Callback OAuth (обмен кода) |
| POST | `/api/oauth/watch/start` | Запуск push-канала |
| POST | `/api/oauth/watch/stop` | Остановка push-канала |
| GET/POST | `/api/webhook/calendar` | Доставка Google push-уведомлений |
| GET/POST | `/api/demo/busy` | Имитация события мастера (только demo) |
| POST | `/api/demo/busy/seed` | Засев демо-занятости |
| POST | `/api/booking/reminders/run` | Ручной запуск напоминаний |
