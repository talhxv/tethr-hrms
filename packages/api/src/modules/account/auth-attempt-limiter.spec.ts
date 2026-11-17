import { AuthAttemptLimiter } from './auth-attempt-limiter';

describe('AuthAttemptLimiter', () => {
  it('allows attempts up to the limit, then refuses within the window', () => {
    const limiter = new AuthAttemptLimiter();
    for (let attempt = 0; attempt < 3; attempt += 1) {
      expect(() => limiter.consume('login:email:alex.morgan@example.com', 3, 60_000)).not.toThrow();
    }
    expect(() => limiter.consume('login:email:alex.morgan@example.com', 3, 60_000)).toThrow(/Too many attempts/);
  });

  it('counts each key separately', () => {
    const limiter = new AuthAttemptLimiter();
    limiter.consume('login:email:alex.morgan@example.com', 1, 60_000);
    expect(() => limiter.consume('login:email:jordan.lee@example.com', 1, 60_000)).not.toThrow();
  });

  it('allows attempts again once the window has passed', () => {
    jest.useFakeTimers();
    try {
      const limiter = new AuthAttemptLimiter();
      limiter.consume('signup:address:203.0.113.7', 1, 60_000);
      jest.advanceTimersByTime(60_001);
      expect(() => limiter.consume('signup:address:203.0.113.7', 1, 60_000)).not.toThrow();
    } finally {
      jest.useRealTimers();
    }
  });
});
