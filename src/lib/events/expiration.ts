/**
 * Domain policy for event visibility once event rendering is implemented.
 * The timezone is intentionally named rather than represented by a fixed UTC
 * offset so the business rule remains explicit and future-proof.
 */
export const eventExpirationPolicy = {
  timeZone: 'America/Argentina/Buenos_Aires',
  automaticExpirationLocalTime: '08:00',
  daysAfterEvent: 1,
} as const;

interface ExpirableEvent {
  date: string;
  visible: boolean;
  expiresAt?: string;
}

const zonedDateTimeFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: eventExpirationPolicy.timeZone,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

function addCalendarDays(date: string, days: number): string | null {
  const [year, month, day] = date.split('-').map(Number);
  const source = new Date(Date.UTC(year, month - 1, day, 12));

  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    ![year, month, day].every(Number.isFinite) ||
    source.getUTCFullYear() !== year ||
    source.getUTCMonth() !== month - 1 ||
    source.getUTCDate() !== day
  ) {
    return null;
  }

  const result = new Date(Date.UTC(year, month - 1, day + days, 12));

  return result.toISOString().slice(0, 10);
}

function getZonedDateTimeParts(date: Date): Record<string, number> {
  const parts = Object.fromEntries(
    zonedDateTimeFormatter
      .formatToParts(date)
      .filter(({ type }) => type !== 'literal')
      .map(({ type, value }) => [type, Number(value)]),
  );

  return parts;
}

function getTimeZoneOffsetMilliseconds(date: Date): number {
  const parts = getZonedDateTimeParts(date);
  const zonedTimeAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );

  return zonedTimeAsUtc - Math.floor(date.getTime() / 1000) * 1000;
}

function localDateTimeToTimestamp(date: string, time: string): number | null {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);

  if (![year, month, day, hour, minute].every(Number.isFinite)) {
    return null;
  }

  const utcGuess = Date.UTC(year, month - 1, day, hour, minute);
  const firstPass = utcGuess - getTimeZoneOffsetMilliseconds(new Date(utcGuess));
  const secondPass = utcGuess - getTimeZoneOffsetMilliseconds(new Date(firstPass));

  return secondPass;
}

export function getEventExpirationTime(
  event: Pick<ExpirableEvent, 'date' | 'expiresAt'>,
): number | null {
  if (event.expiresAt) {
    const customExpiration = Date.parse(event.expiresAt);

    if (!Number.isNaN(customExpiration)) {
      return customExpiration;
    }
  }

  const automaticExpirationDate = addCalendarDays(
    event.date,
    eventExpirationPolicy.daysAfterEvent,
  );

  if (!automaticExpirationDate) {
    return null;
  }

  return localDateTimeToTimestamp(
    automaticExpirationDate,
    eventExpirationPolicy.automaticExpirationLocalTime,
  );
}

export function isEventActive(event: ExpirableEvent, now = new Date()): boolean {
  if (!event.visible) {
    return false;
  }

  const expirationTime = getEventExpirationTime(event);

  return expirationTime !== null && now.getTime() < expirationTime;
}
