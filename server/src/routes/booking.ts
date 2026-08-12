import { Router } from 'express';
import { env } from '../config/env.js';
import { storage } from '../lib/storage.js';
import { sseBroadcast } from '../lib/sse.js';
import { calendar } from '../services/calendar.js';
import {
  bookingConfirmationHtml,
  sendEmail,
  sendTelegram,
} from '../services/notifications.js';
import { dayWindow, getServiceDef, isSlotFree, parseMoscowTime } from '../services/slots.js';

export const bookingRouter = Router();

bookingRouter.post('/', async (req, res) => {
  const body = (req.body || {}) as {
    serviceId?: string;
    date?: string;
    time?: string;
    clientName?: string;
    phone?: string;
    email?: string;
    comment?: string;
    consent?: boolean;
  };

  if (body.consent !== true) {
    return res.status(400).json({
      error: 'Необходимо согласие на обработку персональных данных',
    });
  }
  const name = String(body.clientName || '').trim();
  if (name.length < 2) return res.status(400).json({ error: 'Укажите имя' });
  const phone = String(body.phone || '').replace(/[^\d+]/g, '');
  if (!/^\+?\d{10,15}$/.test(phone)) {
    return res.status(400).json({ error: 'Укажите корректный номер телефона' });
  }
  if (typeof body.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
    return res.status(400).json({ error: 'Некорректная дата' });
  }
  if (typeof body.time !== 'string' || !/^\d{2}:\d{2}$/.test(body.time)) {
    return res.status(400).json({ error: 'Некорректное время' });
  }

  const service = getServiceDef(body.serviceId || 'comb-manicure');
  const start = parseMoscowTime(body.date, body.time);
  if (!start.isValid) return res.status(400).json({ error: 'Некорректные дата/время' });

  const { start: ws, end: we } = dayWindow(body.date);
  if (start < ws || start >= we) {
    return res.status(400).json({ error: 'Время вне рабочего интервала (10:00–20:00)' });
  }
  const end = start.plus({ minutes: service.durationMin });

  // Revalidate against the live calendar to prevent double booking.
  const busy = await calendar.getBusy(ws.toJSDate(), we.toJSDate());
  if (!isSlotFree(body.date, body.time, busy, service.id)) {
    return res.status(409).json({
      error: 'Это время только что заняли. Выберите другой слот — он уже не отображается.',
    });
  }

  const record = storage.addBooking({
    serviceId: service.id,
    serviceName: service.name,
    clientName: name,
    phone,
    email: body.email?.trim() || undefined,
    comment: body.comment?.trim() || undefined,
    start: start.toISO() ?? '',
    end: end.toISO() ?? '',
  });

  await calendar.createEvent({
    summary: `[${name}] | ${service.name}`,
    description: [
      `Запись с сайта STUDIO SETA`,
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Email: ${body.email || '—'}`,
      `Комментарий: ${body.comment || '—'}`,
    ].join('\n'),
    start: start.toJSDate(),
    end: end.toJSDate(),
  });
  calendar.invalidateCache();

  if (record.email) {
    await sendEmail(record.email, 'STUDIO SETA — запись подтверждена', bookingConfirmationHtml(record));
  } else {
    await sendTelegram(
      `Запись подтверждена для ${name} (${phone}) — ${service.name}, ${start.setZone(env.timezone).setLocale('ru').toFormat('d MMMM, HH:mm')}`,
    );
  }
  await sendTelegram(
    `Новая запись на сайте\n${name} — ${service.name}\n${start.setZone(env.timezone).setLocale('ru').toFormat('ccc, d MMMM, HH:mm')}\nТел: ${phone}`,
  );

  sseBroadcast('booking', { date: body.date, serviceId: service.id });

  return res.status(201).json({
    ok: true,
    booking: {
      id: record.id.slice(0, 8),
      serviceName: service.name,
      price: service.price,
      start: start.toISO(),
      end: end.toISO(),
      durationMin: service.durationMin,
    },
  });
});

/**
 * Manual reminder trigger (used for testing the 24h notification flow).
 */
bookingRouter.post('/reminders/run', async (_req, res) => {
  const { runReminders } = await import('../services/reminders.js');
  const sent = await runReminders();
  return res.json({ ok: true, sent });
});
