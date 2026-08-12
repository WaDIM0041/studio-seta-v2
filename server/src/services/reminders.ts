import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import { storage } from '../lib/storage.js';
import { bookingReminderHtml, sendEmail, sendTelegram } from './notifications.js';

/**
 * Sends "visits tomorrow" reminders between 20h and 24h before the slot.
 * Runs every 10 minutes; each booking is reminded exactly once.
 */
export async function runReminders(): Promise<number> {
  const now = DateTime.now().setZone(env.timezone);
  const candidates = storage.getBookings().filter(
    (b) => b.status === 'confirmed' && !b.remindedAt,
  );
  let sent = 0;
  for (const b of candidates) {
    const start = DateTime.fromISO(b.start).setZone(env.timezone);
    const hoursLeft = start.diff(now, 'hours').hours;
    if (hoursLeft > 20 && hoursLeft <= 24) {
      if (b.email) {
        await sendEmail(b.email, 'STUDIO SETA — напоминание о визите', bookingReminderHtml(b));
      } else {
        await sendTelegram(
          `Напоминание клиенту ${b.clientName} (${b.phone}): ${b.serviceName} завтра в ${start.toFormat('HH:mm')}`,
        );
      }
      storage.updateBooking(b.id, { remindedAt: new Date().toISOString() });
      sent += 1;
    }
  }
  return sent;
}

export function startReminderLoop(): void {
  const loop = async (): Promise<void> => {
    try {
      const sent = await runReminders();
      if (sent > 0) console.log(`[reminders] отправлено напоминаний: ${sent}`);
    } catch (err) {
      console.error('[reminders] error', err);
    }
  };
  setTimeout(loop, 30_000);
  setInterval(loop, 10 * 60_000);
}
