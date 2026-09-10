import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getEventExpirationTime,
  isEventActive,
} from '../src/lib/events/expiration.ts';

test('event remains active until 08:00 Argentina time on the next day', () => {
  const event = {
    date: '2026-09-05',
    visible: true,
  };

  assert.equal(isEventActive(event, new Date('2026-09-06T10:59:59Z')), true);
  assert.equal(isEventActive(event, new Date('2026-09-06T11:00:00Z')), false);
  assert.equal(getEventExpirationTime(event), Date.parse('2026-09-06T11:00:00Z'));
});

test('custom expiration takes precedence over the automatic policy', () => {
  const event = {
    date: '2026-09-05',
    visible: true,
    expiresAt: '2026-09-08T15:00:00Z',
  };

  assert.equal(isEventActive(event, new Date('2026-09-08T14:59:59Z')), true);
  assert.equal(isEventActive(event, new Date('2026-09-08T15:00:00Z')), false);
  assert.equal(getEventExpirationTime(event), Date.parse('2026-09-08T15:00:00Z'));
});

test('invalid custom expiration falls back to the automatic policy', () => {
  const event = {
    date: '2026-09-05',
    visible: true,
    expiresAt: 'not-a-date',
  };

  assert.equal(getEventExpirationTime(event), Date.parse('2026-09-06T11:00:00Z'));
});

test('automatic expiration handles calendar year rollover', () => {
  const event = {
    date: '2026-12-31',
    visible: true,
  };

  assert.equal(getEventExpirationTime(event), Date.parse('2027-01-01T11:00:00Z'));
});

test('invalid event dates are treated as inactive', () => {
  const event = {
    date: '2026-02-31',
    visible: true,
  };

  assert.equal(getEventExpirationTime(event), null);
  assert.equal(isEventActive(event, new Date('2026-02-01T12:00:00Z')), false);
});

test('hidden events are never active', () => {
  assert.equal(
    isEventActive(
      {
        date: '2026-09-05',
        visible: false,
      },
      new Date('2026-09-05T12:00:00Z'),
    ),
    false,
  );
});
