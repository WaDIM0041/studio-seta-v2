import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildClientTelegramText, buildOwnerTelegramText } from './notifications.js';

const details = {
  clientName: 'Анна',
  phone: '+7 914 993-99-02',
  serviceName: 'Маникюр комби',
  startIso: '2026-08-12T08:00:00Z',
};

test('owner notification carries name, contact, date and time', () => {
  const text = buildOwnerTelegramText(details);

  assert.match(text, /Новая запись на сайте/);
  assert.match(text, /Анна — Маникюр комби/);
  assert.match(text, /Тел: \+7 914 993-99-02/);
  // fmt() renders in studio timezone (Europe/Moscow) with ru locale.
  assert.match(text, /12 августа/);
  assert.match(text, /11:00/);
});

test('client confirmation references the chosen service and time', () => {
  const text = buildClientTelegramText(details);

  assert.match(text, /Запись подтверждена/);
  assert.match(text, /Анна, вы записаны: Маникюр комби/);
  assert.match(text, /11:00/);
});
