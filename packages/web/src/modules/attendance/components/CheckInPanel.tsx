import { formatDate, todayDateKey } from '@hrms/shared';
import { IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import { serverNow } from '../hooks/serverClock';
import type { SelfClock } from '../hooks/useSelfClock';

import { formatDuration, formatHours } from './attendanceFormat';

const SECONDS_PER_HOUR = 3600;

const formatTime = (iso: string): string =>
  new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(iso));

const formatDayAndTime = (iso: string): string =>
  new Intl.DateTimeFormat('en', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));

const pad = (value: number): string => String(value).padStart(2, '0');

/** 2:05:09 — a stopwatch reading; hours are not capped at 24. */
const formatStopwatch = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
};

/** Seconds since `since` on the server's clock, ticking once a second while a
 *  session is open (see serverClock: device drift would otherwise stall it). */
const useElapsedSeconds = (since: string | null): number => {
  const [now, setNow] = useState(() => serverNow());
  useEffect(() => {
    if (!since) return undefined;
    setNow(serverNow());
    const timer = window.setInterval(() => setNow(serverNow()), 1000);
    return () => window.clearInterval(timer);
  }, [since]);
  if (!since) return 0;
  return Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));
};

type CheckInPanelProps = { readonly clock: SelfClock };

/**
 * One state, one action. Checked out: a single "Check in". Checked in: a
 * running timer from the server's clock-in time and a single "Check out" —
 * the action you cannot take is not offered, rather than refused after a tap.
 * The flip happens on tap (optimistic), and rolls back if the server refuses.
 */
export const CheckInPanel = ({ clock }: CheckInPanelProps) => {
  const { theme } = useTheme();
  const elapsed = useElapsedSeconds(clock.openSince);
  const isOpen = clock.openSince !== null;
  // A session opened on an earlier day almost always means a missed check-out.
  const isStale =
    clock.openSince !== null && todayDateKey(new Date(clock.openSince)) !== todayDateKey();
  const busy = clock.clockingIn || clock.clockingOut || !clock.statusKnown;

  const todaySeconds = Math.round(clock.todayHours * SECONDS_PER_HOUR) + (isStale ? 0 : elapsed);
  const summary = isOpen
    ? isStale
      ? null
      : `${formatDuration(todaySeconds)} worked today`
    : clock.todayHours > 0
      ? `${formatDuration(todaySeconds)} worked today`
      : clock.latestEntry
        ? `Last recorded ${formatHours(clock.latestEntry.hours)} on ${formatDate(clock.latestEntry.date)}`
        : 'No hours recorded yet';

  return (
    <div className="check-in-panel">
      {/* Polite live region: the state flip is the confirmation, so screen
          readers hear "Checked in since 9:02 AM" instead of a separate banner. */}
      <div className="check-in-status" aria-live="polite">
        <span aria-hidden="true" className={`check-in-dot${isOpen ? ' check-in-dot-on' : ''}`} />
        <span>
          {!clock.statusKnown
            ? 'Checking your status…'
            : clock.openSince
              ? `Checked in since ${isStale ? formatDayAndTime(clock.openSince) : formatTime(clock.openSince)}`
              : 'Not checked in'}
        </span>
      </div>

      {isOpen ? (
        <div className="check-in-timer" role="timer" aria-label="Time checked in">
          {formatStopwatch(elapsed)}
        </div>
      ) : null}
      {summary ? <p className="check-in-summary">{summary}</p> : null}

      {isStale ? (
        <p className="check-in-warning" role="status">
          Looks like you forgot to check out. Check out now, then ask HR to correct that day’s
          hours.
        </p>
      ) : null}
      {clock.error ? (
        <p className="auth-error" role="alert">
          {clock.error}
        </p>
      ) : null}

      {isOpen ? (
        <button
          className="button button-secondary check-in-button"
          disabled={busy}
          type="button"
          onClick={() => void clock.clockOut()}
        >
          <IconPlayerStop
            aria-hidden="true"
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.md}
          />
          Check out
        </button>
      ) : (
        <button
          className="button button-primary check-in-button"
          disabled={busy}
          type="button"
          onClick={() => void clock.clockIn()}
        >
          <IconPlayerPlay
            aria-hidden="true"
            size={theme.icon.size.md}
            stroke={theme.icon.stroke.md}
          />
          Check in
        </button>
      )}
    </div>
  );
};
