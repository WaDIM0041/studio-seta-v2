import { DateTime } from 'luxon';
import { env } from '../config/env.js';
import { getService, type ServiceDef } from '../data/services.js';
import type { BusyInterval } from './calendar.js';

export function getServiceDef(id: string): ServiceDef {
  return getService(id);
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
