import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapGoogleProfile } from './clientIdentity.js';

test('maps a verified Google payload to the client profile', () => {
  const profile = mapGoogleProfile({
    sub: '1234567890',
    email: 'Anna@Example.COM',
    email_verified: true,
    name: ' Анна Иванова ',
    picture: 'https://example.com/photo.jpg',
  });

  assert.equal(profile?.sub, '1234567890');
  assert.equal(profile?.email, 'anna@example.com');
  assert.equal(profile?.name, 'Анна Иванова');
  assert.equal(profile?.picture, 'https://example.com/photo.jpg');
  assert.equal(profile?.emailVerified, true);
});

test('rejects payloads without sub or without a real email', () => {
  assert.equal(mapGoogleProfile({ email: 'x@example.com' }), null);
  assert.equal(mapGoogleProfile({ sub: '1', email: '   ' }), null);
});

test('unverified email is still accepted but flagged', () => {
  const profile = mapGoogleProfile({ sub: '1', email: 'a@example.com', email_verified: false });
  assert.equal(profile?.emailVerified, false);
});
