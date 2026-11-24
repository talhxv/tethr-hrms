import { useMutation } from '@apollo/client';
import { dateKeyDaysAgo, todayDateKey } from '@hrms/shared';
import { useState } from 'react';

import { useQuery } from '../../../app/apollo-hooks';
import {
  CLOCK_IN_ME_MUTATION,
  CLOCK_OUT_ME_MUTATION,
  MY_OPEN_CLOCK_IN_QUERY,
  MY_TIME_ENTRIES_QUERY,
} from '../graphql/attendance.operations';

import { recordServerTimestamp, serverNow } from './serverClock';

export type MyTimeEntry = {
  readonly id: string;
  readonly date: string;
  readonly hours: number;
  readonly source: string;
};

type MyTimeEntriesData = { readonly myTimeEntries: readonly MyTimeEntry[] };
type ClockInMeData = {
  readonly clockInMe: { readonly id: string; readonly occurredAt: string };
};
type ClockOutMeData = { readonly clockOutMe: MyTimeEntry & { readonly __typename?: string } };
type MyOpenClockInData = {
  readonly myOpenClockIn: {
    readonly __typename?: 'ClockEvent';
    readonly id: string;
    readonly occurredAt: string;
  } | null;
};

export type SelfClock = {
  /** Most recent day first. */
  readonly entries: readonly MyTimeEntry[];
  readonly todayEntry: MyTimeEntry | null;
  readonly latestEntry: MyTimeEntry | null;
  /** Hours from sessions already closed today (a running session is not included). */
  readonly todayHours: number;
  readonly weekHours: number;
  /** When the running session started (ISO), or null when checked out. */
  readonly openSince: string | null;
  /** False until the server has said whether a session is open. */
  readonly statusKnown: boolean;
  readonly error: string | null;
  readonly clockingIn: boolean;
  readonly clockingOut: boolean;
  readonly clockIn: () => Promise<void>;
  readonly clockOut: () => Promise<void>;
};

/** The local calendar key `days` before today — calendar math, so a DST
 *  transition can never land on the neighbouring date. */
const daysAgo = (days: number): string => dateKeyDaysAgo(days);

const MILLISECONDS_PER_HOUR = 3_600_000;
const OPTIMISTIC_CLOCK_IN_ID = 'optimistic-clock-in';

/**
 * Self-service clocking. Both mutations resolve the employee from the session on
 * the server, so nothing here ever sends an employee id — there is no way to
 * point it at a colleague. Shared so the home screen's check-in card and the
 * attendance page read the same numbers from one query.
 *
 * Whether a session is open comes from the server, not local state, so the
 * right action shows after a refresh or when checking in on another device.
 */
export const useSelfClock = (historyDays = 7): SelfClock => {
  const [error, setError] = useState<string | null>(null);

  const { data, refetch } = useQuery<MyTimeEntriesData>(MY_TIME_ENTRIES_QUERY, {
    variables: { from: daysAgo(historyDays), to: todayDateKey() },
  });
  const {
    data: openData,
    error: openError,
    refetch: refetchOpen,
  } = useQuery<MyOpenClockInData>(MY_OPEN_CLOCK_IN_QUERY, { fetchPolicy: 'cache-and-network' });
  const [clockInMe, { loading: clockingIn }] = useMutation(CLOCK_IN_ME_MUTATION);
  const [clockOutMe, { loading: clockingOut }] = useMutation(CLOCK_OUT_ME_MUTATION);

  const entries = [...(data?.myTimeEntries ?? [])].sort((left, right) =>
    right.date.localeCompare(left.date),
  );
  const today = todayDateKey();
  const todayEntry = entries.find((entry) => entry.date === today) ?? null;
  const todayHours = entries
    .filter((entry) => entry.date === today)
    .reduce((sum, entry) => sum + entry.hours, 0);
  // Always the last seven days, whatever range was fetched, so the figure means
  // the same thing wherever it is shown.
  const weekStart = daysAgo(7);
  const weekHours = entries
    .filter((entry) => entry.date >= weekStart)
    .reduce((sum, entry) => sum + entry.hours, 0);

  const entriesVariables = { from: daysAgo(historyDays), to: todayDateKey() };

  const run = async (action: () => Promise<unknown>): Promise<void> => {
    setError(null);
    try {
      await action();
    } catch (caught) {
      // Apollo has already rolled the optimistic flip back by now.
      setError(caught instanceof Error ? caught.message : 'That did not go through');
    }
    // Reconcile in the background, never blocking the button: a refused punch
    // usually means this screen was stale (e.g. checked in on the phone).
    void Promise.allSettled([refetch(), refetchOpen()]);
  };

  // The card flips the moment you tap: the open session is written to the cache
  // optimistically, then replaced by the server's answer (or rolled back).
  const clockIn = () => {
    const requestStartedAt = Date.now();
    return run(() =>
      clockInMe({
        optimisticResponse: {
          clockInMe: {
            __typename: 'ClockEvent',
            id: OPTIMISTIC_CLOCK_IN_ID,
            employeeId: '',
            type: 'in',
            occurredAt: new Date(serverNow()).toISOString(),
            source: 'web',
          },
        },
        update: (cache, result) => {
          const event = (result.data as ClockInMeData | null | undefined)?.clockInMe;
          if (!event) return;
          // The real response (not the optimistic one): measure clock drift
          // before the cache write re-renders the timer against it.
          if (event.id !== OPTIMISTIC_CLOCK_IN_ID) {
            recordServerTimestamp(event.occurredAt, requestStartedAt);
          }
          cache.writeQuery<MyOpenClockInData>({
            query: MY_OPEN_CLOCK_IN_QUERY,
            data: {
              myOpenClockIn: {
                __typename: 'ClockEvent',
                id: event.id,
                occurredAt: event.occurredAt,
              },
            },
          });
        },
      }),
    );
  };

  const openSince = openData?.myOpenClockIn?.occurredAt ?? null;

  const clockOut = () => {
    const workedHours = openSince
      ? Math.max(0, (serverNow() - new Date(openSince).getTime()) / MILLISECONDS_PER_HOUR)
      : 0;
    return run(() =>
      clockOutMe({
        optimisticResponse: {
          clockOutMe: {
            __typename: 'TimeEntry',
            id: 'optimistic-clock-out',
            employeeId: '',
            date: todayDateKey(),
            hours: Math.round(workedHours * 100) / 100,
            source: 'clock',
          },
        },
        update: (cache, result) => {
          const entry = (result.data as ClockOutMeData | null | undefined)?.clockOutMe;
          if (!entry) return;
          cache.writeQuery<MyOpenClockInData>({
            query: MY_OPEN_CLOCK_IN_QUERY,
            data: { myOpenClockIn: null },
          });
          // Add the closed session so today's total does not dip while the
          // background refetch is in flight.
          cache.updateQuery<MyTimeEntriesData>(
            { query: MY_TIME_ENTRIES_QUERY, variables: entriesVariables },
            (current) =>
              current
                ? {
                    myTimeEntries: [
                      ...current.myTimeEntries.filter((existing) => existing.id !== entry.id),
                      entry,
                    ],
                  }
                : current,
          );
        },
      }),
    );
  };

  return {
    entries,
    todayEntry,
    latestEntry: entries[0] ?? null,
    todayHours,
    weekHours,
    openSince,
    // If the status query fails, fall back to offering "Check in" rather than
    // leaving the button disabled; the server still refuses a double check-in.
    statusKnown: openData !== undefined || openError !== undefined,
    error,
    clockingIn,
    clockingOut,
    clockIn,
    clockOut,
  };
};
