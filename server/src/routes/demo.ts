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
  if (storage.getDemoBusy().length > 0) {
    return res.json({ ok: true, busy: storage.getDemoBusy() });
  }
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
  return res.json({ ok: true, busy: items });
});
