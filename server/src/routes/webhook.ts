import { Router } from 'express';
import { calendar } from '../services/calendar.js';
import { sseBroadcast } from '../lib/sse.js';

export const webhookRouter = Router();

/**
 * Google Calendar push notification delivery point.
 * GET  — channel verification (echo channel id/token)
 * POST — resource changed: invalidate cache and broadcast realtime event
 *
 * Note: production requires a public HTTPS address (PUBLIC_BASE_URL).
 */
webhookRouter.get('/', (req, res) => {
  const id = req.header('X-Goog-Channel-Id') || '';
  const token = req.header('X-Goog-Channel-Token') || '';
  res.status(200).send(`channel: ${id}\ntoken: ${token}`);
});

webhookRouter.post('/', async (req, res) => {
  const state = req.header('X-Goog-Resource-State') || 'changed';
  const resource = req.header('X-Goog-Resource-Id') || '';
  calendar.invalidateCache();
  sseBroadcast('calendar-change', {
    state,
    resource,
    at: new Date().toISOString(),
  });
  res.status(200).json({ ok: true });
});
