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
   доступности `GET /api/slots/week` (с `fill` — занятость дня, и `closed` —
   выходные/персональные дни мастера).
2. Выбирается услуга (длительность влияет на алгоритм слотов) и дата →
   `GET /api/slots?date=YYYY-MM-DD&serviceId=…`.
3. **Алгоритм свободных окон** (`server/src/services/slots.ts`):
   - рабочее окно 10:00–20:00 (Europe/Moscow), нерабочие дни из `WORK_DAYS`/`CLOSED_DATES`;
   - `calendar.getBusy()` берёт из Google `freebusy.query` занятые интервалы;
   - стартовое время допустимо, если вся длительность услуги помещается до
     начала ближайшего занятого блока (и до 20:00);
   - шаг сетки 30 минут. Пример: запись 12:00–14:00 → предложатся 10:00, 10:30,
     14:00, 14:30, 16:00 …
4. Клиент заполняет форму. Обязательно согласие ФЗ-152 (галочка). Сырые поля
   проверяются в `server/src/lib/validate.ts` (изолированная чистая функция).
5. `POST /api/booking` **повторно валидирует слот** по живому календарю —
   защита от двойной записи (409, если слот только что заняли).
6. Создаётся событие `[Имя клиента] | Услуга` в Primary-календаре. Если клиент
   указал email, он добавляется **attendee** события + `sendUpdates: 'all'` —
   Google отправляет ему приглашение, и запись появляется в его личном календаре.
   В локальное хранилище пишется запись, клиенту уходит подтверждение (Email или
   Telegram), владельцу — мгновенное уведомление в Telegram
   (имя, контакт, дата, время).
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
- **Владельцу**: мгновенное уведомление о новой записи в Telegram
  (`TELEGRAM_BOT_TOKEN`) — имя, телефон, услуга, дата и время. Тексты собираются
  чистыми функциями `buildOwnerTelegramText` / `buildClientTelegramText`.

## Вход клиента через Google

- Фронтенд показывает кнопку «Войти через Google» (Google Identity Services) в
  шаге «Данные», если `GET /api/auth/config` вернул `googleSignIn: true`
  (т.е. задан `GOOGLE_CLIENT_ID`).
- Клик → Google выдаёт `id_token` от аккаунта, уже вошедшего на устройстве →
  `POST /api/auth/google` верифицирует подпись и audience
  (`OAuth2Client.verifyIdToken`), `mapGoogleProfile` нормализует профиль
  (`server/src/services/clientIdentity.ts`).
- Профиль подставляет имя/email в форму; email фиксируется, и при записи клиент
  становится attendee события (см. сценарий записи).

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
| GET/POST | `/api/demo/closed` | Персональные выходные мастера (только demo) |
| POST | `/api/demo/closed/seed` | Засев персональных выходных |
| POST | `/api/booking/reminders/run` | Ручной запуск напоминаний |

## Тесты

Юнит-тесты на встроенном `node:test` (без доп. зависимостей), покрывают
интеграционный поток: валидацию запроса, алгоритм слотов (защита от двойной
записи), заполненность/выходные дня, построение события Google (attendee +
`sendUpdates`) и текст Telegram-уведомления владельцу.

```bash
npm test
```
