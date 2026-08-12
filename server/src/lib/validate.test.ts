import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBookingInput } from './validate.js';

const valid = {
  serviceId: 'comb-manicure',
  date: '2026-08-12',
  time: '12:00',
  clientName: 'Анна',
  phone: '+7 914 993-99-02',
  consent: true,
};

test('rejects booking without ФЗ-152 consent', () => {
  const r = validateBookingInput({ ...valid, consent: false });
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /согласие/);
});

test('rejects too-short client name', () => {
  const r = validateBookingInput({ ...valid, clientName: 'А' });
  assert.equal(r.ok, false);
});

test('rejects malformed phone', () => {
  const r = validateBookingInput({ ...valid, phone: 'abc123' });
  assert.equal(r.ok, false);
});

test('rejects malformed date and time', () => {
  assert.equal(validateBookingInput({ ...valid, date: '12-08-2026' }).ok, false);
  assert.equal(validateBookingInput({ ...valid, time: '24:00' }).ok, false);
});

test('accepts a valid request and normalizes optional fields', () => {
  const r = validateBookingInput({
    ...valid,
    email: '  anna@example.com  ',
    comment: '  Без запаха  ',
  });
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.data.name, 'Анна');
    assert.equal(r.data.phone, '+79149939902');
    assert.equal(r.data.email, 'anna@example.com');
    assert.equal(r.data.comment, 'Без запаха');
    assert.equal(r.data.serviceId, 'comb-manicure');
  }
});
