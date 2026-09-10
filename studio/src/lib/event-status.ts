import { eventExpirationPolicy } from './event-expiration-policy.ts';

import type { EventRecord } from './types';

export type EventStatus = 'visible' | 'hidden' | 'finished';

interface LocalDateTimeParts {
  date: string;
  hour: number;
  minute: number;
}

const dateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  calendar: 'gregory',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
  minute: '2-digit',
  month: '2-digit',
  timeZone: eventExpirationPolicy.timeZone,
  year: 'numeric',
});

const dateFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  timeZone: eventExpirationPolicy.timeZone,
  year: 'numeric',
});

const [automaticExpirationHour, automaticExpirationMinute] = eventExpirationPolicy.automaticExpirationLocalTime
  .split(':')
  .map(Number);

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? '';
}

function getLocalDateTimeParts(value: Date): LocalDateTimeParts {
  const parts = dateTimeFormatter.formatToParts(value);
  const year = getPart(parts, 'year');
  const month = getPart(parts, 'month');
  const day = getPart(parts, 'day');

  return {
    date: `${year}-${month}-${day}`,
    hour: Number(getPart(parts, 'hour')),
    minute: Number(getPart(parts, 'minute')),
  };
}

function addCalendarDays(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number);
  if (![year, month, day].every(Number.isFinite)) {
    return null;
  }

  const result = new Date(Date.UTC(year, month - 1, day + days, 12));
  return result.toISOString().slice(0, 10);
}

function isValidDateOnly(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function isEventDateInPast(date: string | undefined, now = new Date()) {
  if (!isValidDateOnly(date)) {
    return false;
  }

  return date < getLocalDateTimeParts(now).date;
}

export function isEventExpired(
  event: Pick<EventRecord, 'date' | 'expiresAt'>,
  now = new Date(),
) {
  if (event.expiresAt) {
    const expiration = Date.parse(event.expiresAt);
    if (!Number.isNaN(expiration)) {
      return now.getTime() >= expiration;
    }
  }

  if (!isValidDateOnly(event.date)) {
    return false;
  }

  const expirationDate = addCalendarDays(
    event.date,
    eventExpirationPolicy.daysAfterEvent,
  );
  if (!expirationDate) {
    return false;
  }

  const localNow = getLocalDateTimeParts(now);
  return (
    localNow.date > expirationDate ||
    (localNow.date === expirationDate &&
      (localNow.hour > automaticExpirationHour ||
        (localNow.hour === automaticExpirationHour &&
          localNow.minute >= automaticExpirationMinute)))
  );
}

export function getEventStatus(
  event: Pick<EventRecord, 'date' | 'expiresAt' | 'visible'>,
  now = new Date(),
): EventStatus {
  if (event.visible !== true) {
    return 'hidden';
  }

  if (isEventExpired(event, now)) {
    return 'finished';
  }

  return 'visible';
}

export function isUpcomingEvent(
  event: Pick<EventRecord, 'date' | 'expiresAt' | 'visible'>,
  now = new Date(),
) {
  return !isEventDateInPast(event.date, now) && getEventStatus(event, now) !== 'finished';
}

export function formatEventDate(date: string | undefined) {
  if (!isValidDateOnly(date)) {
    return 'Fecha pendiente';
  }

  const label = dateFormatter.format(new Date(`${date}T12:00:00Z`));
  return label.replace(/\./g, '');
}
