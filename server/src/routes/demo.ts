import { Router } from 'express';
import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import { storage, type DemoBusy } from '../lib/storage.js';
import { sseBroadcast } from '../lib/sse.js';
import { calendar } from '../services/calendar.js';

export const demoRouter = Router();

/**
 * Demo-mode helpers to simulate the owner creating events in the
 * Google Calendar manually. Active only when the demo provider is used.
 */
demoRouter.use((_req, res, next) => {
  if (calendar.kind !== 'demo') {
    return res.status(403).json({ error: 'Доступно только в демо-режиме' });
  }
  next();
});

demoRouter.get('/busy', (_req, res) => {
  res.json({ busy: storage.getDemoBusy() });
});

demoRouter.post('/busy', (req, res) => {
  const { start, end, label } = (req.body || {}) as Partial<DemoBusy>;
  if (
    typeof start !== 'string' ||
    typeof end !== 'string' ||
    !DateTime.fromISO(start).isValid ||
    !DateTime.fromISO(end).isValid ||
    new Date(end) <= new Date(start)
  ) {
    return res.status(400).json({ error: 'Укажите корректные ISO start/end' });
  }
  const items = storage.getDemoBusy();
  items.push({ start, end, label: label || 'Событие мастера' });
  storage.setDemoBusy(items);
  calendar.invalidateCache();
  sseBroadcast('calendar-change', { state: 'demo-busy', at: new Date().toISOString() });
  return res.status(201).json({ ok: true, busy: storage.getDemoBusy() });
});

demoRouter.post('/busy/seed', (_req, res) => {
  if (storage.getDemoBusy().length === 0) {
    const base = DateTime.now().setZone(env.timezone).startOf('day');
    const items = [
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
    storage.setDemoBusy(items);
    calendar.invalidateCache();
    sseBroadcast('calendar-change', { state: 'demo-seeded', at: new Date().toISOString() });
  }
  return res.json({ ok: true, busy: storage.getDemoBusy() });
});

demoRouter.get('/closed', (_req, res) => {
  res.json({ closed: storage.getClosedDates() });
});

demoRouter.post('/closed', (req, res) => {
  const { date } = (req.body || {}) as { date?: unknown };
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Укажите дату в формате YYYY-MM-DD' });
  }
  const items = storage.getClosedDates();
  if (!items.includes(date)) items.push(date);
  storage.setClosedDates(items);
  calendar.invalidateCache();
  sseBroadcast('calendar-change', { state: 'demo-closed', at: new Date().toISOString() });
  return res.status(201).json({ ok: true, closed: items });
});

demoRouter.post('/closed/seed', (_req, res) => {
  if (storage.getClosedDates().length === 0) {
    const base = DateTime.now().setZone(env.timezone).startOf('day');
    const dates = [base.plus({ days: 4 }).toISODate(), base.plus({ days: 9 }).toISODate()].filter(
      (d): d is string => Boolean(d),
    );
    storage.setClosedDates(dates);
    calendar.invalidateCache();
    sseBroadcast('calendar-change', { state: 'demo-closed-seeded', at: new Date().toISOString() });
  }
  return res.json({ ok: true, closed: storage.getClosedDates() });
});
