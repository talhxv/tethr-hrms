import { dateKeyInTimeZone, isValidTimeZone } from './time-zone';

describe('dateKeyInTimeZone', () => {
  it('puts a 1 am Pakistan check-out on the Pakistan date, not the UTC one', () => {
    // 2026-11-17T20:30Z is 01:30 on 18 Nov in Karachi (UTC+5).
    const instant = new Date('2026-11-17T20:30:00Z');
    expect(dateKeyInTimeZone(instant, 'Asia/Karachi')).toBe('2026-11-18');
    expect(dateKeyInTimeZone(instant, 'UTC')).toBe('2026-11-17');
  });
});

describe('isValidTimeZone', () => {
  it('accepts IANA names and rejects anything else', () => {
    expect(isValidTimeZone('Asia/Karachi')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    expect(isValidTimeZone('')).toBe(false);
    expect(isValidTimeZone(5)).toBe(false);
  });
});
