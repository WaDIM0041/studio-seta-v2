import { Router } from 'express';
import { storage } from '../lib/storage.js';
import { validateBookingInput } from '../lib/validate.js';
import { sseBroadcast } from '../lib/sse.js';
import { calendar } from '../services/calendar.js';
import {
  bookingConfirmationHtml,
  buildClientTelegramText,
  buildOwnerTelegramText,
  sendEmail,
  sendTelegram,
} from '../services/notifications.js';
import { dayWindow, getServiceDef, isSlotFree, parseMoscowTime } from '../services/slots.js';

export const bookingRouter = Router();

bookingRouter.post('/', async (req, res) => {
  const validation = validateBookingInput((req.body || {}) as Record<string, unknown>);
  if (!validation.ok) {
    return res.status(400).json({ error: validation.error });
  }
  const { serviceId, date, time, name, phone, email, comment } = validation.data;

  const service = getServiceDef(serviceId);
  const start = parseMoscowTime(date, time);
  if (!start.isValid) return res.status(400).json({ error: 'Некорректные дата/время' });

  const { start: ws, end: we } = dayWindow(date);
  if (start < ws || start >= we) {
    return res.status(400).json({ error: 'Время вне рабочего интервала (10:00–20:00)' });
  }
  const end = start.plus({ minutes: service.durationMin });

  // Revalidate against the live calendar to prevent double booking.
  const busy = await calendar.getBusy(ws.toJSDate(), we.toJSDate());
  if (!isSlotFree(date, time, busy, service.id)) {
    return res.status(409).json({
      error: 'Это время только что заняли. Выберите другой слот — он уже не отображается.',
    });
  }

  const record = storage.addBooking({
    serviceId: service.id,
    serviceName: service.name,
    clientName: name,
    phone,
    email,
    comment,
    start: start.toISO() ?? '',
    end: end.toISO() ?? '',
  });

  // Create the event in the owner's calendar. When the client provided an
  // email, they are added as an attendee so Google invites them and the
  // booking appears in their personal Google Calendar (sendUpdates: 'all').
  await calendar.createEvent({
    summary: `[${name}] | ${service.name}`,
    description: [
      `Запись с сайта STUDIO SETA`,
      `Имя: ${name}`,
      `Телефон: ${phone}`,
      `Email: ${email || '—'}`,
      `Комментарий: ${comment || '—'}`,
    ].join('\n'),
    start: start.toJSDate(),
    end: end.toJSDate(),
    attendeeEmail: email,
  });
  calendar.invalidateCache();

  const telegramDetails = {
    clientName: name,
    phone,
    serviceName: service.name,
    startIso: start.toISO() ?? '',
  };

  if (record.email) {
    await sendEmail(record.email, 'STUDIO SETA — запись подтверждена', bookingConfirmationHtml(record));
  } else {
    await sendTelegram(buildClientTelegramText(telegramDetails));
  }
  // Instant notification to the owner with the booking details.
  await sendTelegram(buildOwnerTelegramText(telegramDetails));

  sseBroadcast('booking', { date, serviceId });

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
