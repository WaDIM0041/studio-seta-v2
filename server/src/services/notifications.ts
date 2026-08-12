import nodemailer, { type Transporter } from 'nodemailer';
import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import { SITE } from '../data/site.js';
import type { BookingRecord } from '../lib/storage.js';

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.email.host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.secure,
      auth: env.email.user
        ? { user: env.email.user, pass: env.email.pass }
        : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const t = getTransporter();
  if (!t) {
    console.log(`\n[mail:dev] to=${to} subject="${subject}"`);
    const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`[mail:dev] ${text.slice(0, 400)}`);
    return;
  }
  await t.sendMail({ from: env.email.from, to, subject, html });
}

export async function sendTelegram(text: string): Promise<void> {
  if (!env.telegram.botToken) {
    console.log(`[tg:dev] ${text}`);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${env.telegram.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: env.telegram.chatId,
        text,
        parse_mode: 'HTML',
      }),
    });
  } catch (err) {
    console.error('[telegram] send failed', err);
  }
}

function fmt(startIso: string): string {
  return DateTime.fromISO(startIso)
    .setZone(env.timezone)
    .setLocale('ru')
    .toFormat('cccc, d MMMM, HH:mm');
}

export interface TelegramBookingDetails {
  clientName: string;
  phone: string;
  serviceName: string;
  startIso: string;
}

/** Instant notification to the owner with the booking details. */
export function buildOwnerTelegramText(d: TelegramBookingDetails): string {
  return [
    'Новая запись на сайте',
    `${d.clientName} — ${d.serviceName}`,
    fmt(d.startIso),
    `Тел: ${d.phone}`,
  ].join('\n');
}

/** Short confirmation sent to the client when they didn't provide an email. */
export function buildClientTelegramText(d: TelegramBookingDetails): string {
  return [
    'Запись подтверждена',
    `${d.clientName}, вы записаны: ${d.serviceName}`,
    fmt(d.startIso),
  ].join('\n');
}

function shellHtml(inner: string): string {
  return `
  <div style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;background:#0b0b0c;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#121212;border:1px solid #262626;border-radius:8px;overflow:hidden;">
      <div style="padding:28px 32px 12px;border-bottom:1px solid #262626;">
        <div style="color:#D4AF37;letter-spacing:0.35em;font-size:13px;font-weight:700;">STUDIO SETA</div>
        <div style="color:#9a978f;font-size:11px;letter-spacing:0.25em;margin-top:4px;">BY CATHERINE</div>
      </div>
      <div style="padding:28px 32px;color:#f4f2ed;font-size:15px;line-height:1.6;">${inner}</div>
      <div style="padding:20px 32px 26px;border-top:1px solid #262626;color:#7a7770;font-size:12px;line-height:1.7;">
        ${SITE.address}<br/>
        ${SITE.workHours}<br/>
        Запись и вопросы: ${SITE.telegram} · ${SITE.phone}
      </div>
    </div>
  </div>`;
}

export function bookingConfirmationHtml(b: BookingRecord): string {
  const start = fmt(b.start);
  const inner = `
    <h2 style="margin:0 0 6px;font-size:20px;font-weight:600;">Запись подтверждена</h2>
    <p style="margin:0 0 18px;color:#9a978f;">${b.clientName}, ваша запись в STUDIO SETA оформлена.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <tr><td style="padding:6px 0;color:#9a978f;">Услуга</td><td style="padding:6px 0;text-align:right;font-weight:600;">${b.serviceName}</td></tr>
      <tr><td style="padding:6px 0;color:#9a978f;">Дата и время</td><td style="padding:6px 0;text-align:right;font-weight:600;color:#D4AF37;">${start}</td></tr>
      <tr><td style="padding:6px 0;color:#9a978f;">Номер записи</td><td style="padding:6px 0;text-align:right;font-weight:600;">${b.id.slice(0, 8)}</td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:13px;color:#9a978f;">Напоминание придёт на этот адрес за 24 часа до визита. Если нужно перенести запись — напишите в ${SITE.telegram}.</p>`;
  return shellHtml(inner);
}

export function bookingReminderHtml(b: BookingRecord): string {
  const start = fmt(b.start);
  const inner = `
    <h2 style="margin:0 0 6px;font-size:20px;font-weight:600;">Напоминание о визите</h2>
    <p style="margin:0 0 18px;color:#9a978f;">Завтра у вас запись в STUDIO SETA:</p>
    <p style="margin:0 0 6px;font-size:16px;font-weight:600;">${b.serviceName}</p>
    <p style="margin:0;font-size:14px;color:#D4AF37;">${start}</p>
    <p style="margin:20px 0 0;font-size:13px;color:#9a978f;">Перенос или отмена — ${SITE.telegram} · ${SITE.phone}</p>`;
  return shellHtml(inner);
}
