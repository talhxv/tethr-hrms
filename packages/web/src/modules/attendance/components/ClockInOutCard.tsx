import { IconClock } from '@tabler/icons-react';

import { useTheme } from '../../../providers/theme/useTheme';
import { useSelfClock } from '../hooks/useSelfClock';

import { CheckInPanel } from './CheckInPanel';

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short' }).format(
    new Date(`${value}T00:00:00`),
  );

const formatWeekday = (value: string): string =>
  new Intl.DateTimeFormat('en', { weekday: 'long' }).format(new Date(`${value}T00:00:00`));

/**
 * The employee attendance screen: the check-in panel (status, running timer,
 * the one action that applies), the running week, and the days already
 * recorded. Everything resolves the employee from the session server-side, so
 * this card never sends an employee id.
 */
export const ClockInOutCard = () => {
  const { theme } = useTheme();
  const clock = useSelfClock(30);

  return (
    <>
      {/* No card heading: the page header above already says what this is, and a
          second title inside the card only repeats it. */}
      <section className="table-shell clock-card">
        <CheckInPanel clock={clock} />

        <div className="field-list check-in-figures">
          <div className="field-row">
            <span className="field-label">Last 7 days</span>
            <span className="field-value">{clock.weekHours.toFixed(2)} hours</span>
          </div>
        </div>
      </section>

      <section className="table-shell">
        <div className="table-title-row">
          <div className="table-title">
            <IconClock aria-hidden="true" size={theme.icon.size.md} /> Recorded days
          </div>
          <div className="table-density">Last 30 days</div>
        </div>
        <div className="stack-list">
          {clock.entries.map((entry) => (
            <div className="stack-row" key={entry.id}>
              <div className="stack-row-copy">
                <div className="employee-primary">{formatWeekday(entry.date)}</div>
                <div className="employee-secondary">
                  {formatDate(entry.date)} · {entry.source === 'clock' ? 'Clocked' : 'Recorded'}
                </div>
              </div>
              <div className="stack-row-figure">{entry.hours.toFixed(2)} h</div>
            </div>
          ))}
          {clock.entries.length === 0 ? (
            <div className="table-empty">No hours recorded in the last 30 days.</div>
          ) : null}
        </div>
      </section>
    </>
  );
};
