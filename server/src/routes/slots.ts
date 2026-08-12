import { Router } from 'express';
import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import { calendar } from '../services/calendar.js';
import { computeFreeSlots, dayWindow, getServiceDef } from '../services/slots.js';

export const slotsRouter = Router();

slotsRouter.get('/', async (req, res) => {
  const { date, serviceId } = req.query;
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Некорректная дата. Формат YYYY-MM-DD' });
  }
  const service = getServiceDef(typeof serviceId === 'string' ? serviceId : 'comb-manicure');
  const { start: ws, end: we } = dayWindow(date);
  const busy = await calendar.getBusy(ws.toJSDate(), we.toJSDate());
  const { slots, busyRanges } = computeFreeSlots(date, busy, service.id);

  return res.json({
    date,
    service: {
      id: service.id,
      name: service.name,
      durationMin: service.durationMin,
      price: service.price,
    },
    workHours: {
      start: env.workHours.start,
      end: env.workHours.end,
      tz: env.timezone,
    },
    busy: busyRanges.map((r) => ({ start: r.start.toISO(), end: r.end.toISO() })),
    slots,
  });
});

slotsRouter.get('/week', async (req, res) => {
  const { serviceId } = req.query;
  const service = getServiceDef(typeof serviceId === 'string' ? serviceId : 'comb-manicure');
  const today = DateTime.now().setZone(env.timezone).startOf('day');
  const days = [];
  for (let i = 0; i < 14; i += 1) {
    const day = today.plus({ days: i });
    const dateStr = day.toISODate() as string;
    const { start: ws, end: we } = dayWindow(dateStr);
    const busy = await calendar.getBusy(ws.toJSDate(), we.toJSDate());
    const { slots } = computeFreeSlots(dateStr, busy, service.id);
    days.push({
      date: dateStr,
      weekday: day.weekday,
      label: day.setLocale('ru').toFormat('ccc, d MMM'),
      slotsCount: slots.length,
      free: slots.length > 0,
    });
  }
  return res.json({ serviceId: service.id, days });
});
