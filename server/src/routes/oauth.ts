import { Router } from 'express';
import { env } from '../config/env.js';
import { calendar } from '../services/calendar.js';

export const oauthRouter = Router();

oauthRouter.get('/status', async (_req, res) => {
  const authorized = await calendar.authorized();
  res.json({
    kind: calendar.kind,
    label: calendar.label,
    configured: calendar.configured,
    authorized,
  });
});

oauthRouter.get('/url', (_req, res) => {
  const url = calendar.getAuthUrl();
  if (!url) return res.status(400).json({ error: 'OAuth недоступен в текущем режиме' });
  res.json({ url });
});

oauthRouter.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (typeof code !== 'string' || !code) {
    return res.status(400).send('Отсутствует OAuth-код');
  }
  try {
    await calendar.exchangeCode(code);
    res.redirect(`${env.frontendUrl}?auth=ok`);
  } catch (err) {
    console.error('[oauth] callback error', err);
    res.status(500).send('Ошибка подключения Google Calendar. Попробуйте ещё раз.');
  }
});

oauthRouter.post('/watch/start', async (_req, res) => {
  try {
    const id = await calendar.startWatch();
    res.json({ ok: true, channelId: id });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

oauthRouter.post('/watch/stop', async (req, res) => {
  const { channelId } = (req.body || {}) as { channelId?: string };
  try {
    await calendar.stopWatch(channelId || '');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
