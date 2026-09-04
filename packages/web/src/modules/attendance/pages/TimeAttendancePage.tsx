import { useMutation, useQuery } from '@apollo/client';
import {
  IconAlertTriangle,
  IconCalendarPlus,
  IconCheck,
  IconClock,
  IconDeviceFloppy,
  IconLock,
  IconSend,
} from '@tabler/icons-react';
import { useMemo, useState, type FormEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import { useAuth } from '../../auth/hooks/useAuth';
import { formatDate, fullName, type EmployeesData } from '../../employees/employee.shared';
import { EMPLOYEES_QUERY } from '../../employees/graphql/employee.operations';
import {
  APPROVE_TIMESHEET_MUTATION,
  LOCK_TIMESHEET_MUTATION,
  OPEN_TIMESHEET_MUTATION,
  RECORD_TIME_ENTRY_MUTATION,
  SUBMIT_TIMESHEET_MUTATION,
  TIMESHEETS_QUERY,
  TIME_ENTRIES_QUERY,
} from '../graphql/attendance.operations';

type TimeEntryRecord = {
  readonly id: string;
  readonly employeeId: string;
  readonly date: string;
  readonly hours: number;
  readonly source: string;
};

type TimesheetRecord = {
  readonly id: string;
  readonly employeeId: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly status: string;
  readonly totalHours: number;
};

type TimeEntriesData = { readonly timeEntries: readonly TimeEntryRecord[] };
type TimesheetsData = { readonly timesheets: readonly TimesheetRecord[] };

type TabKey = 'entries' | 'timesheets';

const TABS: ReadonlyArray<{ readonly key: TabKey; readonly label: string }> = [
  { key: 'entries', label: 'Time entries' },
  { key: 'timesheets', label: 'Timesheets' },
];

// The timesheet lifecycle from timesheet.service: open → submitted → approved →
// locked. Each status only offers the action that can follow it.
const STATUS_COLORS: Record<string, string> = {
  open: 'blue',
  submitted: 'amber',
  approved: 'green',
  locked: 'gray',
};

const isoDaysAgo = (days: number): string =>
  new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

const today = (): string => new Date().toISOString().slice(0, 10);

export const TimeAttendancePage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const { data: employeesData, loading: employeesLoading } =
    useQuery<EmployeesData>(EMPLOYEES_QUERY);
  const employees = useMemo(() => employeesData?.employees ?? [], [employeesData]);

  const [employeeId, setEmployeeId] = useState('');
  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(today());
  const [tab, setTab] = useState<TabKey>('entries');
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Land on the first employee rather than an empty state the user has to clear.
  const activeEmployeeId = employeeId || employees[0]?.id || '';
  const activeEmployee = employees.find((employee) => employee.id === activeEmployeeId) ?? null;

  const canApprove = Boolean(
    user?.roleKeys.includes('tethrAdmin') ||
      user?.roleKeys.includes('tethrHr') ||
      user?.roleKeys.includes('clientAdmin'),
  );

  const {
    data: entriesData,
    loading: entriesLoading,
    error: entriesError,
    refetch: refetchEntries,
  } = useQuery<TimeEntriesData>(TIME_ENTRIES_QUERY, {
    skip: !activeEmployeeId,
    variables: { employeeId: activeEmployeeId, from, to },
  });

  const {
    data: timesheetsData,
    loading: timesheetsLoading,
    error: timesheetsError,
    refetch: refetchTimesheets,
  } = useQuery<TimesheetsData>(TIMESHEETS_QUERY, {
    skip: !activeEmployeeId,
    variables: { employeeId: activeEmployeeId },
  });

  const [recordTimeEntry, { loading: recording }] = useMutation(RECORD_TIME_ENTRY_MUTATION);
  const [openTimesheet, { loading: opening }] = useMutation(OPEN_TIMESHEET_MUTATION);
  const [submitTimesheet] = useMutation(SUBMIT_TIMESHEET_MUTATION);
  const [approveTimesheet] = useMutation(APPROVE_TIMESHEET_MUTATION);
  const [lockTimesheet] = useMutation(LOCK_TIMESHEET_MUTATION);

  const entries = entriesData?.timeEntries ?? [];
  const timesheets = timesheetsData?.timesheets ?? [];
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);

  const [entryForm, setEntryForm] = useState({ date: today(), hours: '8', note: '' });
  const [periodForm, setPeriodForm] = useState({
    periodStart: isoDaysAgo(14),
    periodEnd: today(),
  });

  const run = async (action: () => Promise<unknown>, message: string): Promise<void> => {
    setActionError(null);
    setNotice(null);
    try {
      await action();
      setNotice(message);
    } catch (caught) {
      setActionError(caught instanceof Error ? caught.message : 'That action did not go through');
    }
  };

  const onRecordEntry = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    await run(async () => {
      await recordTimeEntry({
        variables: {
          input: {
            employeeId: activeEmployeeId,
            date: entryForm.date,
            hours: Number(entryForm.hours),
            note: entryForm.note.trim() || null,
          },
        },
      });
      setEntryForm({ date: today(), hours: '8', note: '' });
      await refetchEntries();
    }, 'Time entry recorded');
  };

  const onOpenTimesheet = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    await run(async () => {
      await openTimesheet({
        variables: {
          input: {
            employeeId: activeEmployeeId,
            periodStart: periodForm.periodStart,
            periodEnd: periodForm.periodEnd,
          },
        },
      });
      await refetchTimesheets();
    }, 'Timesheet opened');
  };

  const timesheetAction = async (
    timesheetId: string,
    kind: 'submit' | 'approve' | 'lock',
  ): Promise<void> => {
    const mutations = {
      submit: submitTimesheet,
      approve: approveTimesheet,
      lock: lockTimesheet,
    };
    const messages = {
      submit: 'Timesheet submitted',
      approve: 'Timesheet approved',
      lock: 'Timesheet locked',
    };
    await run(async () => {
      await mutations[kind]({ variables: { timesheetId } });
      await refetchTimesheets();
    }, messages[kind]);
  };

  return (
    <main className="page-frame-wide">
      <section className="employees-content" aria-labelledby="attendance-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="attendance-title">
              Time &amp; attendance
            </h1>
            <p className="page-subtitle">
              Hours worked and timesheet approvals. Employees clock in and out from their own
              portal; corrections are recorded here.
            </p>
          </div>
        </header>

        <div className="directory-toolbar">
          <div className="field attendance-picker">
            <label htmlFor="attendance-employee">Employee</label>
            <select
              id="attendance-employee"
              value={activeEmployeeId}
              onChange={(event) => setEmployeeId(event.target.value)}
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {fullName(employee)} · {employee.employeeNumber}
                </option>
              ))}
            </select>
          </div>
          <div className="field attendance-range">
            <label htmlFor="attendance-from">From</label>
            <input
              id="attendance-from"
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
            />
          </div>
          <div className="field attendance-range">
            <label htmlFor="attendance-to">To</label>
            <input
              id="attendance-to"
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
            />
          </div>
          <span className="directory-count">
            {entriesLoading ? 'Loading…' : `${totalHours.toFixed(2)} hours in range`}
          </span>
        </div>

        {notice ? <p className="form-success">{notice}</p> : null}
        {actionError ? (
          <p className="auth-error" role="alert">
            {actionError}
          </p>
        ) : null}

        <nav className="profile-tabs" aria-label="Attendance views">
          {TABS.map((entry) => (
            <button
              aria-current={tab === entry.key}
              className={`profile-tab${tab === entry.key ? ' is-active' : ''}`}
              key={entry.key}
              type="button"
              onClick={() => setTab(entry.key)}
            >
              {entry.label}
            </button>
          ))}
        </nav>

        {!employeesLoading && employees.length === 0 ? (
          <div className="table-shell">
            <div className="directory-empty">
              <IconClock size={theme.icon.size.xl} stroke={theme.icon.stroke.md} />
              <h2 className="directory-empty-title">No employees yet</h2>
              <p>Onboard someone before recording time against them.</p>
            </div>
          </div>
        ) : null}

        {tab === 'entries' && activeEmployeeId ? (
          <>
            <div className="table-shell">
              {entriesError ? (
                <div className="directory-empty">
                  <IconAlertTriangle size={theme.icon.size.xl} stroke={theme.icon.stroke.md} />
                  <h2 className="directory-empty-title">Could not load time entries</h2>
                  <p>{entriesError.message}</p>
                </div>
              ) : !entriesLoading && entries.length === 0 ? (
                <div className="directory-empty">
                  <IconClock size={theme.icon.size.xl} stroke={theme.icon.stroke.md} />
                  <h2 className="directory-empty-title">No hours in this range</h2>
                  <p>
                    Nothing recorded for {activeEmployee ? fullName(activeEmployee) : 'this person'}{' '}
                    between {formatDate(from)} and {formatDate(to)}.
                  </p>
                </div>
              ) : (
                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Hours</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry) => (
                        <tr key={entry.id}>
                          <td data-label="Date">{formatDate(entry.date)}</td>
                          <td data-label="Hours">{entry.hours.toFixed(2)}</td>
                          <td className="truncate" data-label="Source">{entry.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {canApprove ? (
              <form className="table-shell attendance-form" onSubmit={(e) => void onRecordEntry(e)}>
                <div className="section-title-row">
                  <h2 className="section-title">Record hours</h2>
                </div>
                <p className="field-hint">
                  For corrections and back-dated entries. Clock in/out entries arrive on their own.
                </p>
                <div className="field-group">
                  <div className="field">
                    <label htmlFor="entry-date">Date</label>
                    <input
                      id="entry-date"
                      required
                      type="date"
                      value={entryForm.date}
                      onChange={(event) =>
                        setEntryForm((current) => ({ ...current, date: event.target.value }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="entry-hours">Hours</label>
                    <input
                      id="entry-hours"
                      max={24}
                      min={0}
                      required
                      step="0.25"
                      type="number"
                      value={entryForm.hours}
                      onChange={(event) =>
                        setEntryForm((current) => ({ ...current, hours: event.target.value }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="entry-note">Note</label>
                    <input
                      id="entry-note"
                      value={entryForm.note}
                      onChange={(event) =>
                        setEntryForm((current) => ({ ...current, note: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="page-actions">
                  <button className="button button-primary" disabled={recording} type="submit">
                    <IconDeviceFloppy size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                    {recording ? 'Recording...' : 'Record hours'}
                  </button>
                </div>
              </form>
            ) : null}
          </>
        ) : null}

        {tab === 'timesheets' && activeEmployeeId ? (
          <>
            <div className="table-shell">
              {timesheetsError ? (
                <div className="directory-empty">
                  <IconAlertTriangle size={theme.icon.size.xl} stroke={theme.icon.stroke.md} />
                  <h2 className="directory-empty-title">Could not load timesheets</h2>
                  <p>{timesheetsError.message}</p>
                </div>
              ) : !timesheetsLoading && timesheets.length === 0 ? (
                <div className="directory-empty">
                  <IconCalendarPlus size={theme.icon.size.xl} stroke={theme.icon.stroke.md} />
                  <h2 className="directory-empty-title">No timesheets yet</h2>
                  <p>Open a period below to start collecting hours into a timesheet.</p>
                </div>
              ) : (
                <div className="employee-table-wrap">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Total hours</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timesheets.map((timesheet) => (
                        <tr key={timesheet.id}>
                          <td>
                            {formatDate(timesheet.periodStart)} – {formatDate(timesheet.periodEnd)}
                          </td>
                          <td data-label="Total hours">{timesheet.totalHours.toFixed(2)}</td>
                          <td data-label="Status">
                            <span
                              className="chip"
                              style={
                                {
                                  '--chip-color': `var(--hrms-color-tag-${
                                    STATUS_COLORS[timesheet.status] ?? 'gray'
                                  })`,
                                } as React.CSSProperties
                              }
                            >
                              <span className="chip-dot" />
                              {timesheet.status}
                            </span>
                          </td>
                          <td data-label="Actions">
                            {canApprove ? (
                              <div className="attendance-row-actions">
                                {timesheet.status === 'open' ? (
                                  <button
                                    className="button button-secondary"
                                    type="button"
                                    onClick={() =>
                                      void timesheetAction(timesheet.id, 'submit')
                                    }
                                  >
                                    <IconSend
                                      size={theme.icon.size.sm}
                                      stroke={theme.icon.stroke.sm}
                                    />
                                    Submit
                                  </button>
                                ) : null}
                                {timesheet.status === 'submitted' ? (
                                  <button
                                    className="button button-secondary"
                                    type="button"
                                    onClick={() =>
                                      void timesheetAction(timesheet.id, 'approve')
                                    }
                                  >
                                    <IconCheck
                                      size={theme.icon.size.sm}
                                      stroke={theme.icon.stroke.sm}
                                    />
                                    Approve
                                  </button>
                                ) : null}
                                {timesheet.status === 'approved' ? (
                                  <button
                                    className="button button-secondary"
                                    type="button"
                                    onClick={() => void timesheetAction(timesheet.id, 'lock')}
                                  >
                                    <IconLock
                                      size={theme.icon.size.sm}
                                      stroke={theme.icon.stroke.sm}
                                    />
                                    Lock
                                  </button>
                                ) : null}
                                {timesheet.status === 'locked' ? (
                                  <span className="employee-secondary">Closed</span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="employee-secondary">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {canApprove ? (
              <form
                className="table-shell attendance-form"
                onSubmit={(e) => void onOpenTimesheet(e)}
              >
                <div className="section-title-row">
                  <h2 className="section-title">Open a timesheet</h2>
                </div>
                <div className="field-group">
                  <div className="field">
                    <label htmlFor="period-start">Period start</label>
                    <input
                      id="period-start"
                      required
                      type="date"
                      value={periodForm.periodStart}
                      onChange={(event) =>
                        setPeriodForm((current) => ({
                          ...current,
                          periodStart: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="period-end">Period end</label>
                    <input
                      id="period-end"
                      required
                      type="date"
                      value={periodForm.periodEnd}
                      onChange={(event) =>
                        setPeriodForm((current) => ({ ...current, periodEnd: event.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="page-actions">
                  <button className="button button-primary" disabled={opening} type="submit">
                    <IconCalendarPlus size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                    {opening ? 'Opening...' : 'Open timesheet'}
                  </button>
                </div>
              </form>
            ) : null}
          </>
        ) : null}
      </section>
    </main>
  );
};
