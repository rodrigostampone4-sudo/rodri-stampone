import assert from 'node:assert/strict';
import test from 'node:test';

import { eventExpirationPolicy as landingExpirationPolicy } from '../src/lib/events/expiration.ts';
import { eventExpirationPolicy as studioExpirationPolicy } from '../studio/src/lib/event-expiration-policy.ts';
import {
  getEventStatus,
  isEventDateInPast,
  isEventExpired,
  isUpcomingEvent,
} from '../studio/src/lib/event-status.ts';

const event = {
  date: '2026-08-29',
  visible: true,
};

test('landing and Studio use the same expiration policy', () => {
  assert.deepEqual(studioExpirationPolicy, landingExpirationPolicy);
});

test('automatic expiration changes at 08:00 in Buenos Aires', () => {
  const beforeExpiration = new Date('2026-08-30T10:59:59.000Z');
  const atExpiration = new Date('2026-08-30T11:00:00.000Z');

  assert.equal(isEventExpired(event, beforeExpiration), false);
  assert.equal(getEventStatus(event, beforeExpiration), 'visible');
  assert.equal(isEventExpired(event, atExpiration), true);
  assert.equal(getEventStatus(event, atExpiration), 'finished');
});

test('an explicit expiresAt value overrides the automatic policy', () => {
  const eventWithExpiration = {
    ...event,
    expiresAt: '2026-08-29T20:00:00.000Z',
  };

  assert.equal(isEventExpired(eventWithExpiration, new Date('2026-08-29T19:59:59.000Z')), false);
  assert.equal(isEventExpired(eventWithExpiration, new Date('2026-08-29T20:00:00.000Z')), true);
});

test('hidden status has priority over expiration status', () => {
  assert.equal(
    getEventStatus({ ...event, visible: false }, new Date('2026-08-30T11:00:00.000Z')),
    'hidden',
  );
});

test('date tabs classify the post-event grace period as past while status remains visible', () => {
  const duringGracePeriod = new Date('2026-08-30T10:59:59.000Z');

  assert.equal(isEventDateInPast(event.date, duringGracePeriod), true);
  assert.equal(isUpcomingEvent(event, duringGracePeriod), false);
  assert.equal(getEventStatus(event, duringGracePeriod), 'visible');
});
