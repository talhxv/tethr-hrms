import { useSelfClock } from '../hooks/useSelfClock';

import { AttendanceHistory, HISTORY_DAYS } from './AttendanceHistory';
import { CheckInPanel } from './CheckInPanel';

/**
 * The employee attendance screen: the check-in panel (status, running timer,
 * the one action that applies), then the history — headline figures, the
 * activity grid and recent days. Everything resolves the employee from the
 * session server-side, so this screen never sends an employee id.
 */
export const ClockInOutCard = () => {
  const clock = useSelfClock(HISTORY_DAYS);

  return (
    <>
      {/* No card heading: the page header above already says what this is, and a
          second title inside the card only repeats it. */}
      <section className="table-shell clock-card">
        <CheckInPanel clock={clock} />
      </section>

      <AttendanceHistory entries={clock.entries} />
    </>
  );
};
