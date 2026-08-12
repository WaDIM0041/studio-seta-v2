import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildEventInsertParams, type CalendarEvent } from './calendar.js';

const base: CalendarEvent = {
  summary: '[Анна] | Маникюр комби',
  description: 'Запись с сайта STUDIO SETA',
  start: new Date('2026-08-12T07:00:00Z'),
  end: new Date('2026-08-12T08:30:00Z'),
};

test('with attendeeEmail the client is invited and updates are sent', () => {
  const params = buildEventInsertParams({ ...base, attendeeEmail: 'anna@example.com' });

  assert.equal(params.calendarId, 'primary');
  assert.equal(params.sendUpdates, 'all');
  assert.deepEqual(params.requestBody.attendees, [{ email: 'anna@example.com' }]);
  assert.equal(params.requestBody.summary, base.summary);
  assert.equal(params.requestBody.description, base.description);
  assert.deepEqual(params.requestBody.start, { dateTime: base.start.toISOString() });
  assert.deepEqual(params.requestBody.end, { dateTime: base.end.toISOString() });
});

test('without attendeeEmail no invite is sent', () => {
  const params = buildEventInsertParams(base);

  assert.equal(params.sendUpdates, undefined);
  assert.equal(params.requestBody.attendees, undefined);
});
