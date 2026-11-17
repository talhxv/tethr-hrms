import { todayDateKey } from '@hrms/shared';
import { IconCalendarStats, IconClock } from '@tabler/icons-react';
import { useMemo, useState, type KeyboardEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import type { MyTimeEntry } from '../hooks/useSelfClock';

import { formatHours } from './attendanceFormat';

/** Weeks shown in the activity grid; the caller must fetch this much history. */
export const HISTORY_WEEKS = 20;
export const HISTORY_DAYS = HISTORY_WEEKS * 7;

// A full day is the reference for the bars and the darkest shade.
const FULL_DAY_HOURS = 8;
const RECENT_DAY_LIMIT = 10;

type Day = {
  readonly key: string;
  readonly date: Date;
  readonly hours: number;
  readonly sessions: number;
  readonly future: boolean;
};

type Level = 0 | 1 | 2 | 3 | 4;

// Shade buckets: none, under 2h, under 4h, under 7h, 7h or more.
const levelFor = (hours: number): Level =>
  hours <= 0 ? 0 : hours < 2 ? 1 : hours < 4 ? 2 : hours < 7 ? 3 : 4;

const LEVEL_LEGEND: ReadonlyArray<{ readonly level: Level; readonly label: string }> = [
  { level: 0, label: 'No hours' },
  { level: 1, label: 'Under 2h' },
  { level: 2, label: '2–4h' },
  { level: 3, label: '4–7h' },
  { level: 4, label: '7h or more' },
];

const WEEKDAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

const formatLongDay = (date: Date): string =>
  new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'short' }).format(date);
const formatShortMonth = (date: Date): string =>
  new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
const parseDateKey = (key: string): Date => new Date(`${key}T00:00:00`);

const addDays = (date: Date, amount: number): Date => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

/** Monday of the week containing `date` (weeks start on Monday). */
const startOfWeek = (date: Date): Date => {
  const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return addDays(day, -((day.getDay() + 6) % 7));
};

const sessionLabel = (count: number): string => `${count} session${count === 1 ? '' : 's'}`;

type AttendanceHistoryProps = { readonly entries: readonly MyTimeEntry[] };

/**
 * Hours as a picture: a few headline figures, a GitHub-style grid of the last
 * twenty weeks (darker = longer day; hover or tap a day for its detail), and the
 * recent days as one row per day — sessions are folded into their day, since
 * "Tuesday, 7h 30m" is the fact people want, not five separate punches.
 */
export const AttendanceHistory = ({ entries }: AttendanceHistoryProps) => {
  const { theme } = useTheme();
  const today = todayDateKey();
  const [selectedKey, setSelectedKey] = useState(today);

  const { weeks, byDay, monthLabels } = useMemo(() => {
    const totals = new Map<string, { hours: number; sessions: number }>();
    for (const entry of entries) {
      const current = totals.get(entry.date) ?? { hours: 0, sessions: 0 };
      totals.set(entry.date, {
        hours: current.hours + entry.hours,
        sessions: current.sessions + 1,
      });
    }
    const firstMonday = addDays(startOfWeek(parseDateKey(today)), -(HISTORY_WEEKS - 1) * 7);
    const grid: Day[][] = [];
    for (let week = 0; week < HISTORY_WEEKS; week += 1) {
      const days: Day[] = [];
      for (let weekday = 0; weekday < 7; weekday += 1) {
        const date = addDays(firstMonday, week * 7 + weekday);
        const key = todayDateKey(date);
        const total = totals.get(key);
        days.push({
          key,
          date,
          hours: total?.hours ?? 0,
          sessions: total?.sessions ?? 0,
          future: key > today,
        });
      }
      grid.push(days);
    }
    // A month label sits over the first week that starts in that month.
    const labels = grid.map((days, index) =>
      index === 0 || days[0].date.getMonth() !== grid[index - 1][0].date.getMonth()
        ? formatShortMonth(days[0].date)
        : '',
    );
    return { weeks: grid, byDay: totals, monthLabels: labels };
  }, [entries, today]);

  const allDays = weeks.flat().filter((day) => !day.future);
  const weekStartKey = todayDateKey(startOfWeek(parseDateKey(today)));
  const thisWeekHours = allDays
    .filter((day) => day.key >= weekStartKey)
    .reduce((sum, day) => sum + day.hours, 0);
  const last30Key = todayDateKey(addDays(parseDateKey(today), -29));
  const last30 = allDays.filter((day) => day.key >= last30Key && day.hours > 0);
  const daysWorked30 = last30.length;
  const averageHours =
    daysWorked30 > 0 ? last30.reduce((sum, day) => sum + day.hours, 0) / daysWorked30 : 0;
  const totalHours = allDays.reduce((sum, day) => sum + day.hours, 0);
  const daysWorkedTotal = allDays.filter((day) => day.hours > 0).length;

  const onCellKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = { ArrowUp: -1, ArrowDown: 1, ArrowLeft: -7, ArrowRight: 7 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const next = todayDateKey(addDays(parseDateKey(selectedKey), step));
    if (next > today || !allDays.some((day) => day.key === next)) return;
    setSelectedKey(next);
    event.currentTarget
      .closest('.activity-grid')
      ?.querySelector<HTMLButtonElement>(`[data-day="${next}"]`)
      ?.focus();
  };

  const selected = allDays.find((day) => day.key === selectedKey) ?? null;
  const recentDays = [...byDay.entries()]
    .filter(([, total]) => total.hours > 0)
    .sort(([left], [right]) => right.localeCompare(left))
    .slice(0, RECENT_DAY_LIMIT);

  return (
    <>
      <section
        className="metric-strip metric-strip-3 attendance-metrics"
        aria-label="Attendance summary"
      >
        <div className="metric-card">
          <div className="metric-label">This week</div>
          <div className="metric-value">{formatHours(thisWeekHours)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Daily average</div>
          <div className="metric-value">{daysWorked30 > 0 ? formatHours(averageHours) : '—'}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Last 30 days</div>
          <div className="metric-value">
            {daysWorked30} day{daysWorked30 === 1 ? '' : 's'}
          </div>
        </div>
      </section>

      <section className="table-shell attendance-activity">
        <div className="table-title-row">
          <div className="table-title">
            <IconCalendarStats aria-hidden="true" size={theme.icon.size.md} /> Activity
          </div>
          <div className="table-density">Last {HISTORY_WEEKS} weeks</div>
        </div>

        <div className="activity-body">
          <div
            className="activity-chart"
            role="group"
            aria-label={`${daysWorkedTotal} days worked in the last ${HISTORY_WEEKS} weeks, ${formatHours(totalHours)} in total. Darker squares are longer days.`}
            aria-describedby="activity-caption"
            style={{ ['--activity-weeks' as string]: HISTORY_WEEKS }}
          >
            <div className="activity-months" aria-hidden="true">
              {monthLabels.map((label, index) => (
                <span key={weeks[index][0].key}>{label}</span>
              ))}
            </div>
            <div className="activity-weekdays" aria-hidden="true">
              {WEEKDAY_LABELS.map((label, index) => (
                <span key={index}>{label}</span>
              ))}
            </div>
            {/* Roving focus: one tab stop for the whole grid; arrows move by day
                (up/down) and week (left/right). Each square is a real button
                with its day and hours as its name. */}
            <div className="activity-grid" role="group" aria-label="Days">
              {weeks
                .flat()
                .map((day) =>
                  day.future ? (
                    <span
                      aria-hidden="true"
                      className="activity-cell activity-cell-future"
                      key={day.key}
                    />
                  ) : (
                    <button
                      aria-label={`${formatLongDay(day.date)}: ${
                        day.hours > 0 ? formatHours(day.hours) : 'no hours'
                      }`}
                      aria-pressed={day.key === selectedKey}
                      className={[
                        'activity-cell',
                        `activity-level-${levelFor(day.hours)}`,
                        day.key === today ? 'activity-cell-today' : '',
                        day.key === selectedKey ? 'activity-cell-selected' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      data-day={day.key}
                      key={day.key}
                      tabIndex={day.key === selectedKey ? 0 : -1}
                      type="button"
                      onClick={() => setSelectedKey(day.key)}
                      onFocus={() => setSelectedKey(day.key)}
                      onKeyDown={onCellKeyDown}
                      onMouseEnter={() => setSelectedKey(day.key)}
                    />
                  ),
                )}
            </div>
          </div>

          <div className="activity-footer">
            <p className="activity-caption" id="activity-caption">
              {selected ? (
                <>
                  <span className="employee-primary">{formatLongDay(selected.date)}</span>
                  {' · '}
                  {selected.hours > 0
                    ? `${formatHours(selected.hours)} across ${sessionLabel(selected.sessions)}`
                    : 'No hours recorded'}
                </>
              ) : null}
            </p>
            <div className="activity-legend" aria-hidden="true">
              <span>Less</span>
              {LEVEL_LEGEND.map((item) => (
                <span
                  className={`activity-cell activity-level-${item.level}`}
                  key={item.level}
                  title={item.label}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </section>

      <section className="table-shell">
        <div className="table-title-row">
          <div className="table-title">
            <IconClock aria-hidden="true" size={theme.icon.size.md} /> Recent days
          </div>
          <div className="table-density">Bar = share of an {FULL_DAY_HOURS}h day</div>
        </div>
        <ul className="stack-list recent-days">
          {recentDays.map(([key, total]) => (
            <li className="stack-row recent-day" key={key}>
              <div className="stack-row-copy">
                <div className="employee-primary">{formatLongDay(parseDateKey(key))}</div>
                <div className="employee-secondary">{sessionLabel(total.sessions)}</div>
              </div>
              <div className="recent-day-figure">
                <span className="recent-day-bar" aria-hidden="true">
                  <span
                    style={{
                      width: `${Math.min(100, (total.hours / FULL_DAY_HOURS) * 100)}%`,
                    }}
                  />
                </span>
                <span className="stack-row-figure">{formatHours(total.hours)}</span>
              </div>
            </li>
          ))}
          {recentDays.length === 0 ? (
            <li className="table-empty">
              No hours recorded yet. Check in to start your first day.
            </li>
          ) : null}
        </ul>
      </section>
    </>
  );
};
