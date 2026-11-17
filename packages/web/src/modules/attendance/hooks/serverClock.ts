// Device clocks drift from the server's (seconds, sometimes minutes). The
// running timer subtracts the server's clock-in time from "now", so "now" has
// to be on the server's clock too, or the timer sits at 0:00:00 (device behind)
// or jumps ahead (device ahead) until the drift is covered.
//
// The offset is anchored to the tap: server timestamp minus the moment the
// request started on this device. That folds the request's latency into the
// offset (at most a few seconds on a cold API), and in exchange the timer is
// continuous: it starts on tap, does not jump when the server's time replaces
// the optimistic one, and reads the same after a reload. Remembered per
// browser so a reload keeps the correction.

const STORAGE_KEY = 'hrms.serverClockOffsetMs';
// Beyond this the measurement is more likely a bad sample than real drift.
const MAX_PLAUSIBLE_OFFSET_MS = 24 * 60 * 60 * 1000;

const readStored = (): number => {
  try {
    const value = Number(window.localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

let offsetMs = typeof window === 'undefined' ? 0 : readStored();

/** Current time on the server's clock, in epoch milliseconds. */
export const serverNow = (): number => Date.now() + offsetMs;

/** Record drift from a server timestamp produced by a request this device
 *  started at `requestStartedAt` (`Date.now()`). */
export const recordServerTimestamp = (serverIso: string, requestStartedAt: number): void => {
  const measured = new Date(serverIso).getTime() - requestStartedAt;
  if (!Number.isFinite(measured) || Math.abs(measured) > MAX_PLAUSIBLE_OFFSET_MS) return;
  offsetMs = measured;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(Math.round(measured)));
  } catch {
    // Storage unavailable (private mode): the correction lasts for this page only.
  }
};
