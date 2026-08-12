import cors from 'cors';
import express from 'express';
import { DateTime } from 'luxon';
import { env } from './config/env.js';
import { storage } from './lib/storage.js';
import { sseConnect } from './lib/sse.js';
import { buildProvider } from './services/calendar.js';
import { startReminderLoop } from './services/reminders.js';
import { bookingRouter } from './routes/booking.js';
import { demoRouter } from './routes/demo.js';
import { oauthRouter } from './routes/oauth.js';
import { servicesRouter } from './routes/services.js';
import { slotsRouter } from './routes/slots.js';
import { statusRouter } from './routes/status.js';
import { webhookRouter } from './routes/webhook.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'studio-seta-api', time: new Date().toISOString() });
});

app.get('/api/events/stream', sseConnect);

app.use('/api/services', servicesRouter);
app.use('/api/slots', slotsRouter);
app.use('/api/booking', bookingRouter);
app.use('/api/oauth', oauthRouter);
app.use('/api/webhook/calendar', webhookRouter);
app.use('/api/status', statusRouter);
app.use('/api/demo', demoRouter);

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'Не найдено' });
});

const provider = buildProvider();
void (async () => {
  if (provider.kind === 'demo') {
    if (storage.getDemoBusy().length === 0) {
      const base = DateTime.now().setZone(env.timezone).startOf('day');
      const seeded = [
        { offsetDays: 0, start: 12, end: 13 },
        { offsetDays: 0, start: 16, end: 16.5 },
        { offsetDays: 1, start: 11, end: 12.5 },
        { offsetDays: 1, start: 17, end: 18 },
        { offsetDays: 2, start: 13.5, end: 15 },
      ].map((o) => ({
        start: base.plus({ days: o.offsetDays, hours: o.start }).toISO() ?? '',
        end: base.plus({ days: o.offsetDays, hours: o.end }).toISO() ?? '',
        label: 'Событие мастера (демо)',
      }));
      storage.setDemoBusy(seeded);
      console.log('[demo] засеяны занятые слоты для демонстрации занятости');
    }
  }
  startReminderLoop();
  console.log(`[calendar] провайдер: ${provider.label}`);
  const authorized = await provider.authorized();
  console.log(`[calendar] статус авторизации: ${authorized ? 'подключён' : 'не подключён'}`);
  if (provider.kind === 'google' && authorized) {
    try {
      const id = await provider.startWatch();
      console.log(`[calendar] push-канал запущен: ${id}`);
    } catch (err) {
      console.warn('[calendar] не удалось запустить push-канал:', String(err));
    }
  }
})();

app.listen(env.port, () => {
  console.log(`STUDIO SETA API слушает http://localhost:${env.port}`);
  console.log(`Слоты: ${env.workHours.start}:00–${env.workHours.end}:00 (${env.timezone})`);
});
