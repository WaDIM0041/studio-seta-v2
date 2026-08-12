import { Router } from 'express';
import { env } from '../config/env.js';
import { storage } from '../lib/storage.js';
import { sseClientCount } from '../lib/sse.js';
import { calendar } from '../services/calendar.js';

export const statusRouter = Router();

statusRouter.get('/', async (_req, res) => {
  const authorized = await calendar.authorized();
  res.json({
    ok: true,
    uptimeSec: Math.round(process.uptime()),
    now: new Date().toISOString(),
    timezone: env.timezone,
    workHours: env.workHours,
    slotGranularityMin: env.slotGranularityMin,
    calendar: {
      kind: calendar.kind,
      label: calendar.label,
      configured: calendar.configured,
      authorized,
    },
    bookingsTotal: storage.getBookings().length,
    sseClients: sseClientCount(),
  });
});
