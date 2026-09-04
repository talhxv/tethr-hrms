import { useMutation, useQuery } from '@apollo/client';
import { IconClock, IconPlayerPlay, IconPlayerStop } from '@tabler/icons-react';
import { useState } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import {
  CLOCK_IN_ME_MUTATION,
  CLOCK_OUT_ME_MUTATION,
  MY_TIME_ENTRIES_QUERY,
} from '../graphql/attendance.operations';

type TimeEntryRecord = {
  readonly id: string;
  readonly date: string;
  readonly hours: number;
  readonly source: string;
};

type MyTimeEntriesData = { readonly myTimeEntries: readonly TimeEntryRecord[] };

const today = (): string => new Date().toISOString().slice(0, 10);

const isoDaysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

/**
 * Self-service clock in / out. Both mutations resolve the employee from the
 * session on the server, so this card never sends an employee id — there is
 * nothing here that could be pointed at a colleague.
 */
export const ClockInOutCard = () => {
  const { theme } = useTheme();
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, refetch } = useQuery<MyTimeEntriesData>(MY_TIME_ENTRIES_QUERY, {
    variables: { from: isoDaysAgo(7), to: today() },
  });
  const [clockInMe, { loading: clockingIn }] = useMutation(CLOCK_IN_ME_MUTATION);
  const [clockOutMe, { loading: clockingOut }] = useMutation(CLOCK_OUT_ME_MUTATION);

  const entries = data?.myTimeEntries ?? [];
  const todayEntry = entries.find((entry) => entry.date === today()) ?? null;
  const weekHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  const run = async (action: () => Promise<unknown>, message: string): Promise<void> => {
    setError(null);
    setNotice(null);
    try {
      await action();
      setNotice(message);
      await refetch();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'That did not go through');
    }
  };

  return (
    <section className="self-service-section">
      <div className="panel-title-row">
        <div>
          <div className="panel-kicker">Time</div>
          <h2 className="panel-title">Clock in and out</h2>
        </div>
        <IconClock size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
      </div>

      {notice ? <p className="form-success">{notice}</p> : null}
      {error ? (
        <p className="auth-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="field-list">
        <div className="field-row">
          <span className="field-label">Today</span>
          <span className="field-value">
            {todayEntry ? `${todayEntry.hours.toFixed(2)} hours recorded` : 'Nothing yet'}
          </span>
        </div>
        <div className="field-row">
          <span className="field-label">Last 7 days</span>
          <span className="field-value">{weekHours.toFixed(2)} hours</span>
        </div>
      </div>

      <div className="page-actions clock-actions">
        <button
          className="button button-primary"
          disabled={clockingIn}
          type="button"
          onClick={() => void run(() => clockInMe(), 'Clocked in')}
        >
          <IconPlayerPlay size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
          {clockingIn ? 'Clocking in...' : 'Clock in'}
        </button>
        <button
          className="button button-secondary"
          disabled={clockingOut}
          type="button"
          onClick={() => void run(() => clockOutMe(), 'Clocked out')}
        >
          <IconPlayerStop size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
          {clockingOut ? 'Clocking out...' : 'Clock out'}
        </button>
      </div>
    </section>
  );
};
