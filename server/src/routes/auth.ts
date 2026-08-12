import { Router } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env.js';
import { mapGoogleProfile } from '../services/clientIdentity.js';

export const authRouter = Router();

/**
 * Tells the frontend whether "Sign in with Google" for clients is available.
 * A GOOGLE_CLIENT_ID must be configured; the site origin must be listed in the
 * client's "Authorized JavaScript origins" (Google Cloud Console).
 */
authRouter.get('/config', (_req, res) => {
  res.json({
    googleSignIn: Boolean(env.google.clientId),
    clientId: env.google.clientId || null,
  });
});

/**
 * Verifies the Google Identity Services credential (id_token JWT) issued by
 * the Google account already signed in on the client's device/browser and
 * returns the verified client profile (email, name, picture).
 */
authRouter.post('/google', async (req, res) => {
  const { credential } = (req.body || {}) as { credential?: unknown };
  if (!env.google.clientId) {
    return res.status(400).json({ error: 'Google Sign-In не настроен' });
  }
  if (typeof credential !== 'string' || !credential) {
    return res.status(400).json({ error: 'Отсутствует Google credential' });
  }
  try {
    const client = new OAuth2Client(env.google.clientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: env.google.clientId,
    });
    const profile = mapGoogleProfile(ticket.getPayload() || {});
    if (!profile) {
      return res.status(400).json({ error: 'В профиле Google нет подтверждённого email' });
    }
    return res.json(profile);
  } catch (err) {
    console.error('[auth] google id_token verification failed:', err);
    return res.status(401).json({ error: 'Не удалось проверить Google-аккаунт' });
  }
});
