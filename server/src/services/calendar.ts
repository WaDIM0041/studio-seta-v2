import { Auth, calendar_v3, google } from 'googleapis';
import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import { storage, type GoogleTokens } from '../lib/storage.js';

export interface BusyInterval {
  start: Date;
  end: Date;
}

export interface CalendarEvent {
  summary: string;
  description: string;
  start: Date;
  end: Date;
}

export interface CalendarProvider {
  kind: 'google' | 'demo';
  label: string;
  configured: boolean;
  authorized(): Promise<boolean>;
  getAuthUrl(): string | null;
  exchangeCode(code: string): Promise<void>;
  getBusy(from: Date, to: Date): Promise<BusyInterval[]>;
  createEvent(event: CalendarEvent): Promise<void>;
  startWatch(): Promise<string>;
  stopWatch(id: string): Promise<void>;
  invalidateCache(): void;
}

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.readonly',
];

function redirectUri(): string {
  return env.google.redirectUri || `${env.publicBaseUrl}/api/oauth/callback`;
}

/**
 * OAuth 2.0 connection to the owner's Primary Google Calendar.
 * Enabled when GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.
 */
class GoogleCalendarProvider implements CalendarProvider {
  kind = 'google' as const;
  label = 'Google Calendar (Primary, OAuth 2.0)';
  configured = Boolean(env.google.clientId && env.google.clientSecret);

  private oauth: Auth.OAuth2Client | null = null;
  private cal: calendar_v3.Calendar | null = null;
  private cache = new Map<string, { ts: number; busy: BusyInterval[] }>();
  private watchId: string | null = null;

  private client(): Auth.OAuth2Client {
    if (!this.configured) throw new Error('Google OAuth 2.0 не настроен');
    if (!this.oauth) {
      this.oauth = new google.auth.OAuth2(
        env.google.clientId,
        env.google.clientSecret,
        redirectUri(),
      );
      const tokens = storage.getTokens();
      if (tokens) this.oauth.setCredentials(tokens as Auth.Credentials);
    }
    return this.oauth;
  }

  private calendar(): calendar_v3.Calendar {
    if (!this.cal) this.cal = google.calendar({ version: 'v3', auth: this.client() });
    return this.cal;
  }

  getAuthUrl(): string | null {
    return this.client().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: SCOPES,
    });
  }

  async authorized(): Promise<boolean> {
    if (!this.configured) return false;
    const tokens = storage.getTokens();
    if (!tokens) return false;
    if (typeof tokens.expiry_date === 'number' && tokens.expiry_date > Date.now() + 60_000) {
      return true;
    }
    if (tokens.refresh_token) {
      try {
        await this.client().refreshAccessToken();
        storage.setTokens(this.client().credentials as GoogleTokens);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  async exchangeCode(code: string): Promise<void> {
    const { tokens } = await this.client().getToken(code);
    this.client().setCredentials(tokens as Auth.Credentials);
    storage.setTokens(tokens as GoogleTokens);
  }

  async getBusy(from: Date, to: Date): Promise<BusyInterval[]> {
    const key = `${from.toISOString()}__${to.toISOString()}`;
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.ts < 30_000) return hit.busy;

    const res = await this.calendar().freebusy.query({
      requestBody: {
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: [{ id: env.google.calendarId }],
      },
    });
    const busy =
      res.data.calendars?.[env.google.calendarId]?.busy?.map((b) => ({
        start: new Date(b.start || 0),
        end: new Date(b.end || 0),
      })) || [];
    this.cache.set(key, { ts: Date.now(), busy });
    return busy;
  }

  async createEvent(event: CalendarEvent): Promise<void> {
    await this.calendar().events.insert({
      calendarId: env.google.calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
      },
    });
  }

  async startWatch(): Promise<string> {
    if (this.watchId) return this.watchId;
    const id = `seta-calendar-watch-${Date.now()}`;
    await this.calendar().events.watch({
      calendarId: env.google.calendarId,
      requestBody: {
        id,
        type: 'web_hook',
        address: `${env.publicBaseUrl}/api/webhook/calendar`,
        token: 'seta-push',
      },
    });
    this.watchId = id;
    return id;
  }

  async stopWatch(id: string): Promise<void> {
    try {
      await this.calendar().channels.stop({ requestBody: { id, resourceId: id } });
    } catch {
      // channel may already be expired
    }
    if (this.watchId === id) this.watchId = null;
  }

  invalidateCache(): void {
    this.cache.clear();
  }
}

/**
 * Google Calendar via Service Account (alternative to OAuth).
 * Enabled when GOOGLE_SERVICE_ACCOUNT_KEY_FILE is set.
 */
class ServiceAccountProvider implements CalendarProvider {
  kind = 'google' as const;
  label = 'Google Calendar (Service Account)';
  configured = Boolean(env.google.serviceAccountKeyFile);

  private jwt: Auth.JWT | null = null;
  private cal: calendar_v3.Calendar | null = null;
  private cache = new Map<string, { ts: number; busy: BusyInterval[] }>();

  private client(): Auth.JWT {
    if (!this.configured) throw new Error('Service Account не настроен');
    if (!this.jwt) {
      this.jwt = new google.auth.JWT({
        email: env.google.serviceAccountEmail,
        keyFile: env.google.serviceAccountKeyFile,
        scopes: SCOPES,
        subject: env.google.serviceAccountEmail,
      });
    }
    return this.jwt;
  }

  private calendar(): calendar_v3.Calendar {
    if (!this.cal) this.cal = google.calendar({ version: 'v3', auth: this.client() });
    return this.cal;
  }

  getAuthUrl(): string | null {
    return null;
  }

  async authorized(): Promise<boolean> {
    try {
      await this.client().authorize();
      return true;
    } catch {
      return false;
    }
  }

  async exchangeCode(): Promise<void> {
    throw new Error('Service Account не использует OAuth-код');
  }

  async getBusy(from: Date, to: Date): Promise<BusyInterval[]> {
    const key = `${from.toISOString()}__${to.toISOString()}`;
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.ts < 30_000) return hit.busy;

    const res = await this.calendar().freebusy.query({
      requestBody: {
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: [{ id: env.google.calendarId }],
      },
    });
    const busy =
      res.data.calendars?.[env.google.calendarId]?.busy?.map((b) => ({
        start: new Date(b.start || 0),
        end: new Date(b.end || 0),
      })) || [];
    this.cache.set(key, { ts: Date.now(), busy });
    return busy;
  }

  async createEvent(event: CalendarEvent): Promise<void> {
    await this.calendar().events.insert({
      calendarId: env.google.calendarId,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: { dateTime: event.start.toISOString() },
        end: { dateTime: event.end.toISOString() },
      },
    });
  }

  async startWatch(): Promise<string> {
    throw new Error('Watch-каналы доступны только для OAuth-подключения');
  }

  async stopWatch(): Promise<void> {
    // not supported
  }

  invalidateCache(): void {
    this.cache.clear();
  }
}

/**
 * Demo calendar: uses the local file store. Used when no Google credentials
 * are configured, so the whole booking flow works out of the box for preview.
 */
class DemoCalendarProvider implements CalendarProvider {
  kind = 'demo' as const;
  label = 'Демо-календарь (файловое хранилище)';
  configured = true;

  async authorized(): Promise<boolean> {
    return true;
  }

  getAuthUrl(): string | null {
    return null;
  }

  async exchangeCode(): Promise<void> {
    throw new Error('Демо-режим: OAuth не требуется');
  }

  async getBusy(from: Date, to: Date): Promise<BusyInterval[]> {
    const fromMs = from.getTime();
    const toMs = to.getTime();
    const result: BusyInterval[] = [];
    const push = (s: string, e: string): void => {
      const sMs = new Date(s).getTime();
      const eMs = new Date(e).getTime();
      if (sMs < toMs && eMs > fromMs) {
        result.push({
          start: new Date(Math.max(sMs, fromMs)),
          end: new Date(Math.min(eMs, toMs)),
        });
      }
    };
    storage.getBookings().forEach((b) => push(b.start, b.end));
    storage.getDemoBusy().forEach((d) => push(d.start, d.end));
    return result;
  }

  async createEvent(): Promise<void> {
    // booking is already recorded in the file store — nothing else to do
  }

  async startWatch(): Promise<string> {
    return 'demo-channel';
  }

  async stopWatch(): Promise<void> {
    // no-op
  }

  invalidateCache(): void {
    // read-through, no cache
  }
}

export function buildProvider(): CalendarProvider {
  if (env.google.serviceAccountKeyFile) return new ServiceAccountProvider();
  if (env.google.clientId && env.google.clientSecret) return new GoogleCalendarProvider();
  return new DemoCalendarProvider();
}

/** Active calendar provider for the whole process. */
export const calendar: CalendarProvider = buildProvider();

/**
 * Convenience helper for "today at given hour" inside studio timezone.
 */
export function atToday(hour: number, minute = 0): Date {
  return DateTime.now()
    .setZone(env.timezone)
    .set({ hour, minute, second: 0, millisecond: 0 })
    .toJSDate();
}
