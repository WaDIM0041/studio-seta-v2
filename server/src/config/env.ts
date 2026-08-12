import 'dotenv/config';
import { join } from 'path';

function num(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export const env = {
  port: num(process.env.PORT, 3001),
  publicBaseUrl: process.env.PUBLIC_BASE_URL || 'http://localhost:3001',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  timezone: process.env.STUDIO_TIMEZONE || 'Europe/Moscow',
  workHours: {
    start: num(process.env.WORK_START_HOUR, 10),
    end: num(process.env.WORK_END_HOUR, 20),
  },
  slotGranularityMin: num(process.env.SLOT_GRANULARITY_MIN, 30),
  workDays: (process.env.WORK_DAYS || '1,2,3,4,5,6')
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7),
  closedDates: (process.env.CLOSED_DATES || '')
    .split(',')
    .map((s) => s.trim())
    .filter((s) => /^\d{4}-\d{2}-\d{2}$/.test(s)),
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || '',
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
    serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '',
    serviceAccountKeyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || '',
  },
  email: {
    host: process.env.SMTP_HOST || '',
    port: num(process.env.SMTP_PORT, 587),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'STUDIO SETA <no-reply@studio-seta.ru>',
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: process.env.TELEGRAM_CHAT_ID || '',
  },
  dataDir: process.env.DATA_DIR || join(process.cwd(), '.data'),
};
