import { useMutation, useQuery } from '@apollo/client';
import { dateKeyDaysAgo, todayDateKey } from '@hrms/shared';
import { useState } from 'react';

import {
  CLOCK_IN_ME_MUTATION,
  CLOCK_OUT_ME_MUTATION,
  MY_OPEN_CLOCK_IN_QUERY,
  MY_TIME_ENTRIES_QUERY,
} from '../graphql/attendance.operations';

type MyTimeEntry = {
  readonly id: string;
  readonly date: string;
  readonly hours: number;
  readonly source: string;
};

type MyTimeEntriesData = { readonly myTimeEntries: readonly MyTimeEntry[] };
type MyOpenClockInData = {
  readonly myOpenClockIn: { readonly id: string; readonly occurredAt: string } | null;
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
  readonly notice: string | null;
  readonly error: string | null;
  readonly clockingIn: boolean;
  readonly clockingOut: boolean;
  readonly clockIn: () => Promise<void>;
  readonly clockOut: () => Promise<void>;
};

/** The local calendar key `days` before today — calendar math, so a DST
 *  transition can never land on the neighbouring date. */
const daysAgo = (days: number): string => dateKeyDaysAgo(days);

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
  const [notice, setNotice] = useState<string | null>(null);
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

  const run = async (action: () => Promise<unknown>, message: string): Promise<void> => {
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(message);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'That did not go through');
    } finally {
      // Refresh on failure too: a refused punch usually means this screen was
      // out of date (e.g. checked in from the phone), and the refetch fixes it.
      await Promise.allSettled([refetch(), refetchOpen()]);
    }
  };

  return {
    entries,
    todayEntry,
    latestEntry: entries[0] ?? null,
    todayHours,
    weekHours,
    openSince: openData?.myOpenClockIn?.occurredAt ?? null,
    // If the status query fails, fall back to offering "Check in" rather than
    // leaving the button disabled; the server still refuses a double check-in.
    statusKnown: openData !== undefined || openError !== undefined,
    notice,
    error,
    clockingIn,
    clockingOut,
    clockIn: () => run(() => clockInMe(), 'Checked in'),
    clockOut: () => run(() => clockOutMe(), 'Checked out'),
  };
};
