# Настройка Google Calendar API

Два способа подключить календарь владельца. Достаточно одного.

## Способ 1. OAuth 2.0 (Primary-календарь владельца) — рекомендуемый

1. Войдите в [Google Cloud Console](https://console.cloud.google.com/).
2. Создайте проект (или выберите существующий).
3. **APIs & Services → Enable APIs** → включите **Google Calendar API**.
4. **APIs & Services → OAuth consent screen** → External → добавьте тестовых
   пользователей (email владельца) или отправьте на проверку.
5. **Credentials → Create credentials → OAuth client ID** → тип **Web application**:
   - Authorized redirect URI: `https://<PUBLIC_BASE_URL>/api/oauth/callback`
     (например, `https://studio-seta.ru/api/oauth/callback`);
   - для локальной разработки: `http://localhost:3001/api/oauth/callback`.
6. Скопируйте `Client ID` и `Client secret` в `server/.env`:

```dotenv
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxx
GOOGLE_CALENDAR_ID=primary
PUBLIC_BASE_URL=https://studio-seta.ru
```

7. Перезапустите сервер и выполните авторизацию:

```bash
curl http://localhost:3001/api/oauth/url
```

Откройте полученный URL в браузере владельца и дайте согласие. Сервер сохранит
токены в `server/.data/google-tokens.json` и начнёт обновлять их автоматически.

8. Проверьте: `curl http://localhost:3001/api/oauth/status` → `authorized: true`.

## Вход клиентов через Google («Войти через Google»)

Чтобы клиент авторизовался своим Google-аккаунтом (тем, что уже вошёл на его
телефоне/в браузере) и запись автоматически попала в его личный календарь:

1. В том же OAuth-клиенте (тип **Web application**) добавьте в
   **Authorized JavaScript origins** все публичные origin'ы сайта, например
   `https://studio-seta.ru`, `https://5173-<id>.monkeycode-ai.live`
   и `http://localhost:5173` для разработки.
2. В `server/.env` уже должен быть `GOOGLE_CLIENT_ID` (тот же, что для календаря).
3. На фронтенде в шаге «Данные» формы записи появится кнопка «Войти через Google»
   (Google Identity Services). `id_token` уходит на `POST /api/auth/google`,
   сервер проверяет его подпись и audience через `OAuth2Client.verifyIdToken`.
4. Имя и email клиента подставляются в форму; email фиксируется, и при
   подтверждении записи клиент добавляется **attendee** события
   (`sendUpdates: 'all'`) — Google присылает ему приглашение, и запись
   появляется в его личном Google Calendar.

Без `GOOGLE_CLIENT_ID` кнопка на сайте не показывается (демо-режим).

## Способ 2. Service Account (общий календарь)

1. **Credentials → Create credentials → Service account**.
2. Скачайте JSON-ключ, укажите в `.env`:

```dotenv
GOOGLE_SERVICE_ACCOUNT_EMAIL=seta@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=/путь/к/key.json
GOOGLE_CALENDAR_ID=<email-календаря-владельца>
```

3. В Google Calendar откройте настройки нужного календаря → **Поделиться** →
   добавьте `GOOGLE_SERVICE_ACCOUNT_EMAIL` с правами «Вносить изменения».
   Service Account сможет читать занятость и создавать события.

## Push-уведомления (мгновенное исчезновение слотов)

После подключения OAuth запустите канал:

```bash
curl -X POST http://localhost:3001/api/oauth/watch/start
```

Google будет слать `POST /api/webhook/calendar` при любом изменении календаря.
**Требование**: `PUBLIC_BASE_URL` должен быть публичным HTTPS-адресом —
Google не доставляет webhook на `localhost`.

Заголовки проверки канала (`X-Goog-Channel-Token`) сверяются, кэш свободных
окон инвалидируется, по SSE всем клиентам уходит `calendar-change`.

Каналы живут максимум 24 часа; для продакшена добавьте `setInterval`-обновление
канала (см. `POST /api/oauth/watch/start`).

## Email/SMS

- Email: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.
- SMS-заглушка: при отсутствии SMTP подтверждение печатается в лог сервера,
  а владельцу можно слать уведомления в Telegram через `TELEGRAM_BOT_TOKEN`
  и `TELEGRAM_CHAT_ID`.

## Демо-режим

Без любых Google-креденшелов сервер использует файловый «Демо-календарь».
Все сценарии (слоты, запись, блокировка дублей, исчезновение слота при
изменении календаря) работают локально.
