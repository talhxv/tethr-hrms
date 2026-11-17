import { ValidationFailedError } from '../../common/errors';

// Per-key sliding window for blunt abuse protection on public endpoints (no
// global limiter exists in the stack). In-memory, so it guards a single API
// instance; swap it behind this class for a shared store if the API scales out.
// Keys are evicted once the map exceeds the cap, so a stream of distinct keys
// cannot grow it without bound.
//
// Not injectable itself: each consumer module provides its own subclass so
// counters are never shared between unrelated surfaces.
const MAX_TRACKED_KEYS = 5000;

export abstract class SlidingWindowRateLimiter {
  private readonly hits = new Map<string, number[]>();

  protected abstract readonly limitMessage: string;

  consume(key: string, limit: number, windowMs: number): void {
    const now = Date.now();
    const recent = (this.hits.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
    if (recent.length >= limit) {
      throw new ValidationFailedError(this.limitMessage);
    }
    recent.push(now);
    // Re-insert so the key moves to the end of the insertion order.
    this.hits.delete(key);
    this.hits.set(key, recent);
    if (this.hits.size > MAX_TRACKED_KEYS) {
      this.evict(now, windowMs);
    }
  }

  private evict(now: number, windowMs: number): void {
    for (const [trackedKey, timestamps] of this.hits) {
      const last = timestamps[timestamps.length - 1];
      if (last === undefined || now - last >= windowMs) {
        this.hits.delete(trackedKey);
      }
    }
    while (this.hits.size > MAX_TRACKED_KEYS) {
      const oldest = this.hits.keys().next().value;
      if (oldest === undefined) break;
      this.hits.delete(oldest);
    }
  }
}
