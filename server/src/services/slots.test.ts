import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Hermetic storage: keep closed-date seeding of the dev server out of tests.
process.env.DATA_DIR = mkdtempSync(join(tmpdir(), 'seta-slot-test-'));

const { computeFreeSlots, dayFill, isDateClosed, isSlotFree } = await import('./slots.js');
const { storage } = await import('../lib/storage.js');

function busy(intervals: Array<[string, string]>) {
  return intervals.map(([start, end]) => ({ start: new Date(start), end: new Date(end) }));
}

test('computeFreeSlots removes every slot overlapping a busy block (no double booking)', () => {
  // 08:00Z–09:30Z == 11:00–12:30 Europe/Moscow; service = 90 min.
  const res = computeFreeSlots(
    '2026-08-12',
    busy([['2026-08-12T08:00:00Z', '2026-08-12T09:30:00Z']]),
    'comb-manicure',
  );

  const times = res.slots.map((s) => s.time);
  // Slots whose [start, start+90) window touches 11:00–12:30 disappear.
  assert.equal(times.includes('10:00'), false);
  assert.equal(times.includes('10:30'), false);
  assert.equal(times.includes('11:00'), false);
  assert.equal(times.includes('11:30'), false);
  assert.equal(times.includes('12:00'), false);
  // 18 total 90-min slots minus the 5 covered by the busy block.
  assert.equal(res.slots.length, 13);
});

test('isSlotFree agrees with computeFreeSlots on busy days', () => {
  const dayBusy = busy([['2026-08-12T08:00:00Z', '2026-08-12T09:30:00Z']]);
  assert.equal(isSlotFree('2026-08-12', '10:00', dayBusy, 'comb-manicure'), false);
  assert.equal(isSlotFree('2026-08-12', '12:30', dayBusy, 'comb-manicure'), true);
});

test('dayFill is the share of the working window that is occupied', () => {
  // 11:00–12:30 = 90 of 600 minutes => 0.15.
  const half = dayFill('2026-08-12', busy([['2026-08-12T08:00:00Z', '2026-08-12T09:30:00Z']]));
  assert.equal(half, 0.15);

  // Overlapping intervals are merged before counting: 11:00–13:00 = 120 min => 0.2.
  const merged = dayFill(
    '2026-08-12',
    busy([
      ['2026-08-12T08:00:00Z', '2026-08-12T09:30:00Z'],
      ['2026-08-12T08:30:00Z', '2026-08-12T10:00:00Z'],
    ]),
  );
  assert.equal(merged, 0.2);
});

test('isDateClosed flags Sundays as weekend and demo storage dates as personal days', () => {
  assert.deepEqual(isDateClosed('2026-08-16'), { closed: true, reason: 'weekend' });

  storage.setClosedDates(['2026-08-19']);
  assert.deepEqual(isDateClosed('2026-08-19'), { closed: true, reason: 'date' });

  assert.deepEqual(isDateClosed('2026-08-17'), { closed: false, reason: null });
});
