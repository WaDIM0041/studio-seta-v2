import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import { getService, type ServiceDef } from '../data/services.js';
import { storage } from '../lib/storage.js';
import { calendar, type BusyInterval } from './calendar.js';

export function getServiceDef(id: string): ServiceDef {
  return getService(id);
}

export interface DayClosed {
  closed: boolean;
  reason: 'weekend' | 'date' | null;
}

/**
 * Checks whether the studio is closed on the given date.
 * Either because it's outside the configured work week ("weekend")
 * or the master has a personal day off on that exact date ("date").
 */
export function isDateClosed(dateStr: string): DayClosed {
  const day = DateTime.fromISO(dateStr);
  if (!env.workDays.includes(day.weekday)) return { closed: true, reason: 'weekend' };
  if (env.closedDates.includes(dateStr)) return { closed: true, reason: 'date' };
  if (calendar.kind === 'demo' && storage.getClosedDates().includes(dateStr)) {
    return { closed: true, reason: 'date' };
  }
  return { closed: false, reason: null };
}

/**
 * How much of the working day is already occupied by calendar events
 * (busy minutes / work window minutes), in 0..1. Overlapping events
 * are counted once. Used to fill the date cell in the availability grid.
 */
export function dayFill(dateStr: string, busy: BusyInterval[]): number {
  const { start: ws, end: we } = dayWindow(dateStr);
  const windowMs = we.toMillis() - ws.toMillis();
  if (windowMs <= 0) return 0;

  const ranges = busy
    .map((b) => ({
      start: Math.max(DateTime.fromJSDate(b.start).setZone(env.timezone).toMillis(), ws.toMillis()),
      end: Math.min(DateTime.fromJSDate(b.end).setZone(env.timezone).toMillis(), we.toMillis()),
    }))
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);

  let busyMs = 0;
  let cursor = 0;
  for (const r of ranges) {
    if (r.start > cursor) {
      busyMs += r.end - r.start;
      cursor = r.end;
    } else if (r.end > cursor) {
      busyMs += r.end - cursor;
      cursor = r.end;
    }
  }
  return Math.min(1, busyMs / windowMs);
}

export function dayWindow(dateStr: string): { start: DateTime; end: DateTime } {
  const start = DateTime.fromISO(dateStr, { zone: env.timezone }).set({
    hour: env.workHours.start,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  const end = DateTime.fromISO(dateStr, { zone: env.timezone }).set({
    hour: env.workHours.end,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
  return { start, end };
}

export interface Slot {
  time: string;
  end: string;
  iso: string;
}

export function computeFreeSlots(
  dateStr: string,
  busy: BusyInterval[],
  serviceId: string,
): { slots: Slot[]; busyRanges: { start: DateTime; end: DateTime }[] } {
  const service = getService(serviceId);
  const durationMin = service.durationMin;
  const { start: ws, end: we } = dayWindow(dateStr);

  const ranges = busy
    .map((b) => ({
      start: DateTime.fromJSDate(b.start).setZone(env.timezone).toMillis(),
      end: DateTime.fromJSDate(b.end).setZone(env.timezone).toMillis(),
    }))
    .map((r) => ({
      start: Math.max(r.start, ws.toMillis()),
      end: Math.min(r.end, we.toMillis()),
    }))
    .filter((r) => r.end > r.start)
    .sort((a, b) => a.start - b.start);

  const granularity = env.slotGranularityMin * 60_000;
  const duration = durationMin * 60_000;
  const dayEnd = we.toMillis();
  const slots: Slot[] = [];
  let cursor = ws.toMillis();

  const pushCursor = (): void => {
    const at = DateTime.fromMillis(cursor, { zone: env.timezone });
    slots.push({
      time: at.toFormat('HH:mm'),
      end: at.plus({ minutes: durationMin }).toFormat('HH:mm'),
      iso: at.toISO() ?? '',
    });
  };

  for (const r of ranges) {
    while (cursor + duration <= r.start) {
      pushCursor();
      cursor += granularity;
    }
    cursor = Math.max(cursor, r.end);
  }
  while (cursor + duration <= dayEnd) {
    pushCursor();
    cursor += granularity;
  }

  return {
    slots,
    busyRanges: ranges.map((r) => ({
      start: DateTime.fromMillis(r.start, { zone: env.timezone }),
      end: DateTime.fromMillis(r.end, { zone: env.timezone }),
    })),
  };
}

export function isSlotFree(
  dateStr: string,
  time: string,
  busy: BusyInterval[],
  serviceId: string,
): boolean {
  const { slots } = computeFreeSlots(dateStr, busy, serviceId);
  return slots.some((s) => s.time === time);
}

export function parseMoscowTime(dateStr: string, time: string): DateTime {
  return DateTime.fromISO(`${dateStr}T${time}:00`, { zone: env.timezone });
}
