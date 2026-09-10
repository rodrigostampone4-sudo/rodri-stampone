/**
 * Keep this Studio-local because Vercel builds `studio/` as an isolated root.
 * The root test suite verifies parity with the landing policy.
 */
export const eventExpirationPolicy = {
  timeZone: 'America/Argentina/Buenos_Aires',
  automaticExpirationLocalTime: '08:00',
  daysAfterEvent: 1,
} as const;
