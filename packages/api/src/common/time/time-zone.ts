// Calendar dates for an instant in a given IANA time zone. Work happens on the
// employee's wall clock, not UTC: in Pakistan (UTC+5) a check-out at 1 am is
// still "yesterday" in UTC, so dates derived with toISOString() land a day early.

export const DEFAULT_TIME_ZONE = 'UTC';

/** True when the runtime knows this IANA zone name (e.g. "Asia/Karachi"). */
export const isValidTimeZone = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length === 0) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value });
    return true;
  } catch {
    return false;
  }
};

/** YYYY-MM-DD of `instant` as seen on a wall clock in `timeZone`. */
export const dateKeyInTimeZone = (instant: Date, timeZone: string): string => {
  // en-CA formats dates as YYYY-MM-DD.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
};
