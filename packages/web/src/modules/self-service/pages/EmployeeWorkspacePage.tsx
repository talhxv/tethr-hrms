import { useMutation, useQuery } from '@apollo/client';
import type { ApprovalStatus } from '@hrms/shared';
import type { MainColorName } from '@hrms/ui';
import {
  IconCalendarEvent,
  IconClock,
  IconDeviceFloppy,
  IconMessageCircle,
  IconPlaneDeparture,
  IconSpeakerphone,
  IconUserCircle,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import { SUBMIT_MY_FEEDBACK_MUTATION } from '../../engagement/graphql/engagement.operations';
import {
  MY_WORKSPACE_QUERY,
  SUBMIT_MY_LEAVE_REQUEST_MUTATION,
  UPDATE_MY_EMPLOYEE_PROFILE_MUTATION,
} from '../graphql/self-service.operations';

type EmployeeRecord = {
  readonly id: string;
  readonly employeeNumber: string;
  readonly firstName: string;
  readonly middleName: string | null;
  readonly lastName: string;
  readonly salutation: string | null;
  readonly workEmail: string | null;
  readonly dateOfBirth: string | null;
  readonly hireDate: string;
  readonly probationEndDate: string | null;
  readonly scheduledConfirmationDate: string | null;
  readonly contractEndDate: string | null;
  readonly holidayCalendarId: string | null;
  readonly employmentStatus: string;
  readonly workerType: string;
  readonly currentAssignment: { readonly departmentName: string | null; readonly positionTitle: string | null; readonly locationName: string | null; readonly reportsToName: string | null } | null;
  readonly assignmentHistory: readonly { readonly positionTitle: string | null; readonly departmentName: string | null; readonly locationName: string | null; readonly reportsToName: string | null; readonly validFrom: string; readonly validTo: string | null }[];
};

type EmployeeProfileRecord = {
  readonly employeeId: string;
  readonly photoUrl: string | null;
  readonly personalEmail: string | null;
  readonly phone: string | null;
  readonly addressLine1: string | null;
  readonly addressLine2: string | null;
  readonly city: string | null;
  readonly region: string | null;
  readonly countryCode: string | null;
  readonly postalCode: string | null;
  readonly permanentAddressLine1: string | null;
  readonly permanentAddressLine2: string | null;
  readonly permanentCity: string | null;
  readonly permanentRegion: string | null;
  readonly permanentCountryCode: string | null;
  readonly permanentPostalCode: string | null;
  readonly currentAccommodationType: string | null;
  readonly permanentAccommodationType: string | null;
  readonly preferredContactChannel: string | null;
  readonly emergencyContactName: string | null;
  readonly emergencyContactPhone: string | null;
  readonly emergencyContactRelation: string | null;
};

type LeaveTypeRecord = {
  readonly id: string;
  readonly name: string;
  readonly code: string;
};

type LeaveBalanceRecord = {
  readonly id: string;
  readonly leaveTypeId: string;
  readonly periodYear: number;
  readonly entitledDays: number;
  readonly usedDays: number;
  readonly pendingDays: number;
  readonly availableDays: number;
};

type LeaveRequestRecord = {
  readonly id: string;
  readonly leaveTypeId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly dayCount: number;
  readonly status: ApprovalStatus;
  readonly reason: string | null;
  readonly submittedAt: string;
  readonly decidedAt: string | null;
  readonly decisionNote: string | null;
};

type HolidayRecord = { readonly id: string; readonly date: string; readonly name: string };
type HolidayMonthGroup = {
  readonly key: string;
  readonly label: string;
  readonly holidays: readonly HolidayRecord[];
};
type SalaryRecord = {
  readonly id: string;
  readonly currency: string;
  readonly annualAmount: number;
  readonly validFrom: string;
  readonly validTo: string | null;
  readonly reason: string;
};

type AnnouncementRecord = {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly audience: string;
  readonly isPinned: boolean;
  readonly publishedAt: string;
  readonly expiresAt: string | null;
};

type WorkspaceData = {
  readonly myEmployee: EmployeeRecord;
  readonly myEmployeeProfile: EmployeeProfileRecord | null;
  readonly myEmployeePersonalDetails: { readonly id: string; readonly bio: string | null; readonly maritalStatus: string | null; readonly bloodGroup: string | null } | null;
  readonly myEducations: readonly { readonly id: string; readonly schoolOrUniversity: string }[];
  readonly myWorkHistories: readonly { readonly id: string; readonly companyName: string }[];
  readonly leaveTypes: readonly LeaveTypeRecord[];
  readonly myLeaveBalances: readonly LeaveBalanceRecord[];
  readonly myLeaveRequests: readonly LeaveRequestRecord[];
  readonly upcomingHolidays: readonly HolidayRecord[];
  readonly myCurrentSalaryRevision: SalaryRecord | null;
  readonly announcements: readonly AnnouncementRecord[];
};

type ProfileForm = {
  photoUrl: string;
  personalEmail: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  countryCode: string;
  postalCode: string;
  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentCity: string;
  permanentRegion: string;
  permanentCountryCode: string;
  permanentPostalCode: string;
  currentAccommodationType: string;
  permanentAccommodationType: string;
  preferredContactChannel: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
};

const emptyProfile: ProfileForm = {
  photoUrl: '',
  personalEmail: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  region: '',
  countryCode: '',
  postalCode: '',
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentCity: '',
  permanentRegion: '',
  permanentCountryCode: '',
  permanentPostalCode: '',
  currentAccommodationType: '',
  permanentAccommodationType: '',
  preferredContactChannel: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
};

const today = (): string => new Date().toISOString().slice(0, 10);
const addDays = (date: Date, amount: number): string => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next.toISOString().slice(0, 10);
};
const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
const formatMonth = (value: string): string =>
  new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
const formatDay = (value: string): string =>
  new Intl.DateTimeFormat('en', { day: '2-digit' }).format(new Date(`${value}T00:00:00`));
const formatWeekday = (value: string): string =>
  new Intl.DateTimeFormat('en', { weekday: 'short' }).format(new Date(`${value}T00:00:00`));
const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
const formatMoney = (value: number, currency: string): string =>
  new Intl.NumberFormat('en', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    value,
  );
const daysUntil = (value: string): number =>
  Math.max(0, Math.ceil((new Date(`${value}T00:00:00`).getTime() - Date.now()) / 86_400_000));
const daysSince = (value: string): number =>
  Math.max(0, Math.floor((Date.now() - new Date(`${value}T00:00:00`).getTime()) / 86_400_000));
const initials = (employee: EmployeeRecord): string =>
  `${employee.firstName.charAt(0)}${employee.lastName.charAt(0)}`.toUpperCase();
const chipStyle = (color: MainColorName): CSSProperties & { readonly '--chip-color': string } => ({
  '--chip-color': `var(--hrms-color-tag-${color})`,
});

const requestColor: Record<ApprovalStatus, MainColorName> = {
  pending: 'amber',
  approved: 'green',
  rejected: 'tomato',
  cancelled: 'gray',
};

const requestLabel: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const workerTypeLabels: Record<string, string> = {
  permanent: 'Permanent',
  fixedTerm: 'Fixed term',
  contractor: 'Contractor',
  intern: 'Intern',
  temporary: 'Temporary',
};

const profileFrom = (profile: EmployeeProfileRecord | null): ProfileForm => ({
  photoUrl: profile?.photoUrl ?? '',
  personalEmail: profile?.personalEmail ?? '',
  phone: profile?.phone ?? '',
  addressLine1: profile?.addressLine1 ?? '',
  addressLine2: profile?.addressLine2 ?? '',
  city: profile?.city ?? '',
  region: profile?.region ?? '',
  countryCode: profile?.countryCode ?? '',
  postalCode: profile?.postalCode ?? '',
  permanentAddressLine1: profile?.permanentAddressLine1 ?? '',
  permanentAddressLine2: profile?.permanentAddressLine2 ?? '',
  permanentCity: profile?.permanentCity ?? '',
  permanentRegion: profile?.permanentRegion ?? '',
  permanentCountryCode: profile?.permanentCountryCode ?? '',
  permanentPostalCode: profile?.permanentPostalCode ?? '',
  currentAccommodationType: profile?.currentAccommodationType ?? '',
  permanentAccommodationType: profile?.permanentAccommodationType ?? '',
  preferredContactChannel: profile?.preferredContactChannel ?? '',
  emergencyContactName: profile?.emergencyContactName ?? '',
  emergencyContactPhone: profile?.emergencyContactPhone ?? '',
  emergencyContactRelation: profile?.emergencyContactRelation ?? '',
});

export const EmployeeWorkspacePage = () => {
  const { theme } = useTheme();
  const date = useMemo(() => new Date(), []);
  const variables = useMemo(
    () => ({ asOf: today(), from: today(), to: addDays(date, 120) }),
    [date],
  );
  const { data, loading, error, refetch } = useQuery<WorkspaceData>(MY_WORKSPACE_QUERY, {
    variables,
  });
  const [submitLeave, { loading: submittingLeave }] = useMutation(SUBMIT_MY_LEAVE_REQUEST_MUTATION);
  const [submitFeedback, { loading: submittingFeedback }] = useMutation(
    SUBMIT_MY_FEEDBACK_MUTATION,
  );
  const [updateProfile, { loading: savingProfile }] = useMutation(
    UPDATE_MY_EMPLOYEE_PROFILE_MUTATION,
  );
  const [leaveForm, setLeaveForm] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [profileForm, setProfileForm] = useState<ProfileForm>(emptyProfile);
  const [feedbackForm, setFeedbackForm] = useState({
    category: 'general',
    subject: '',
    body: '',
  });
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    setProfileForm(profileFrom(data?.myEmployeeProfile ?? null));
  }, [data?.myEmployeeProfile]);

  const employee = data?.myEmployee;
  const currentSalary = data?.myCurrentSalaryRevision ?? null;
  const leaveTypesById = useMemo(
    () => new Map(data?.leaveTypes.map((type) => [type.id, type]) ?? []),
    [data?.leaveTypes],
  );
  const totalLeave = useMemo(
    () => (data?.myLeaveBalances ?? []).reduce((sum, balance) => sum + balance.availableDays, 0),
    [data?.myLeaveBalances],
  );
  const probationDays = employee?.probationEndDate ? daysUntil(employee.probationEndDate) : null;
  const sortedRequests = useMemo(
    () =>
      [...(data?.myLeaveRequests ?? [])].sort((left, right) =>
        right.startDate.localeCompare(left.startDate),
      ),
    [data?.myLeaveRequests],
  );
  const announcements = data?.announcements ?? [];
  const latestAnnouncements = useMemo(() => announcements.slice(0, 3), [announcements]);
  const holidayGroups = useMemo<HolidayMonthGroup[]>(() => {
    const groups = new Map<string, HolidayRecord[]>();
    for (const holiday of [...(data?.upcomingHolidays ?? [])].sort((left, right) =>
      left.date.localeCompare(right.date),
    )) {
      const key = holiday.date.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), holiday]);
    }
    return [...groups.entries()].map(([key, holidays]) => ({
      key,
      label: formatMonth(`${key}-01`),
      holidays,
    }));
  }, [data?.upcomingHolidays]);

  const onLeaveSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setLeaveError(null);
    try {
      await submitLeave({
        variables: {
          input: {
            leaveTypeId: leaveForm.leaveTypeId,
            startDate: leaveForm.startDate,
            endDate: leaveForm.endDate,
            reason: leaveForm.reason || undefined,
            holidayCalendarId: employee?.holidayCalendarId ?? undefined,
          },
        },
      });
      setLeaveForm({ leaveTypeId: '', startDate: '', endDate: '', reason: '' });
      await refetch();
    } catch (caught) {
      setLeaveError(caught instanceof Error ? caught.message : 'Could not submit your request');
    }
  };

  const onProfileSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setProfileNotice(null);
    await updateProfile({
      variables: {
        input: Object.fromEntries(
          Object.entries(profileForm).map(([key, value]) => [key, value || null]),
        ),
      },
    });
    setProfileNotice('Profile updated');
    await refetch();
  };

  const onFeedbackSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setFeedbackNotice(null);
    setFeedbackError(null);
    try {
      await submitFeedback({
        variables: {
          input: {
            category: feedbackForm.category,
            subject: feedbackForm.subject.trim(),
            body: feedbackForm.body.trim(),
          },
        },
      });
      setFeedbackForm({ category: 'general', subject: '', body: '' });
      setFeedbackNotice('Feedback submitted');
      await refetch();
    } catch (caught) {
      setFeedbackError(caught instanceof Error ? caught.message : 'Could not submit feedback');
    }
  };

  if (loading) {
    return <main className="portal-loading">Loading your workspace...</main>;
  }

  if (error || !data || !employee) {
    return (
      <main className="portal-loading">
        {error?.message ?? 'Your account is not linked to an employee record yet.'}
      </main>
    );
  }

  return (
    <main className="employee-workspace">
      <section className="employee-workspace-content" aria-labelledby="employee-workspace-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="employee-workspace-title">
              Good day, {employee.firstName}
            </h1>
            <p className="page-subtitle">Your employment, time away, and pay at a glance.</p>
          </div>
          <div className="employee-identity">
            {data?.myEmployeeProfile?.photoUrl ? (
              <img
                alt="Your profile"
                className="employee-identity-photo"
                src={data.myEmployeeProfile.photoUrl}
              />
            ) : (
              <span
                className="employee-avatar employee-identity-avatar"
                style={chipStyle('violet')}
              >
                {initials(employee)}
              </span>
            )}
            <div>
              <div className="employee-primary">
                {employee.firstName} {employee.lastName}
              </div>
              <div className="employee-secondary">{employee.employeeNumber}</div>
            </div>
          </div>
        </header>

        <div className="metric-strip employee-metrics">
          <div className="metric-card">
            <div className="metric-label">Leave available</div>
            <div className="metric-value">{totalLeave.toFixed(1)} days</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Current salary</div>
            <div className="metric-value">
              {currentSalary
                ? formatMoney(currentSalary.annualAmount / 12, currentSalary.currency)
                : 'Not available'}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Days with company</div>
            <div className="metric-value">{daysSince(employee.hireDate)}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Probation</div>
            <div className="metric-value">
              {probationDays === null ? 'Not set' : `${probationDays} days left`}
            </div>
          </div>
        </div>

        <section className="table-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconUserCircle size={theme.icon.size.md} /> Employment facts
            </div>
            <div className="table-density">Self-service</div>
          </div>
          <div className="field-list">
            <div className="field-row">
              <span className="field-label">Date of joining</span>
              <span className="field-value">{formatDate(employee.hireDate)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Days since joining</span>
              <span className="field-value">{daysSince(employee.hireDate)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Probation end</span>
              <span className="field-value">
                {employee.probationEndDate ? formatDate(employee.probationEndDate) : 'Not set'}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Days left in probation</span>
              <span className="field-value">
                {probationDays === null ? 'Not set' : `${probationDays} days`}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Annual salary</span>
              <span className="field-value">
                {currentSalary
                  ? formatMoney(currentSalary.annualAmount, currentSalary.currency)
                  : 'Not available'}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Monthly salary</span>
              <span className="field-value">
                {currentSalary
                  ? formatMoney(currentSalary.annualAmount / 12, currentSalary.currency)
                  : 'Not available'}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Work email</span>
              <span className="field-value">{employee.workEmail ?? 'Not set'}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Worker type</span>
              <span className="field-value">
                {workerTypeLabels[employee.workerType] ?? employee.workerType}
              </span>
            </div>
          </div>
        </section>

        <div className="self-service-grid">
          <section className="table-shell">
            <div className="table-title-row">
              <div className="table-title">
                <IconPlaneDeparture size={theme.icon.size.md} /> Leave balance
              </div>
              <div className="table-density">{new Date().getFullYear()}</div>
            </div>
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Available</th>
                    <th>Used</th>
                    <th>Pending</th>
                  </tr>
                </thead>
                <tbody>
                  {data.myLeaveBalances.map((balance) => (
                    <tr key={balance.id}>
                      <td>{leaveTypesById.get(balance.leaveTypeId)?.name ?? 'Leave'}</td>
                      <td>{balance.availableDays.toFixed(1)} days</td>
                      <td>{balance.usedDays.toFixed(1)} days</td>
                      <td>{balance.pendingDays.toFixed(1)} days</td>
                    </tr>
                  ))}
                  {data.myLeaveBalances.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        Your balances will appear once leave policies are assigned.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="table-shell">
            <div className="table-title-row">
              <div className="table-title">
                <IconCalendarEvent size={theme.icon.size.md} /> Upcoming holidays
              </div>
              <div className="table-density">Next 120 days</div>
            </div>
            <div className="holiday-calendar">
              {holidayGroups.map((group) => (
                <section className="holiday-month" key={group.key}>
                  <div className="holiday-month-title">{group.label}</div>
                  <div className="holiday-date-grid">
                    {group.holidays.map((holiday) => (
                      <div className="holiday-date-tile" key={holiday.id}>
                        <div className="holiday-date-box">
                          <span>{formatWeekday(holiday.date)}</span>
                          <strong>{formatDay(holiday.date)}</strong>
                        </div>
                        <div className="holiday-date-copy">
                          <div className="employee-primary">{holiday.name}</div>
                          <div className="employee-secondary">{formatDate(holiday.date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
              {holidayGroups.length === 0 ? (
                <div className="table-empty">No upcoming holidays on your calendar.</div>
              ) : null}
            </div>
          </section>
        </div>

        <section className="table-shell bulletin-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconSpeakerphone size={theme.icon.size.md} /> News bulletin
            </div>
            <div className="table-density">
              {announcements.length} update{announcements.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="announcement-list compact-announcement-list">
            {latestAnnouncements.map((announcement) => (
              <article className="announcement-item" key={announcement.id}>
                <div className="announcement-meta">
                  {announcement.isPinned ? (
                    <span className="chip" style={chipStyle('amber')}>
                      <span className="chip-dot" />
                      Pinned
                    </span>
                  ) : null}
                  <span>{formatDate(announcement.publishedAt.slice(0, 10))}</span>
                </div>
                <h2 className="announcement-title">{announcement.title}</h2>
                <p className="announcement-body">{announcement.body}</p>
              </article>
            ))}
            {latestAnnouncements.length === 0 ? (
              <p className="table-empty">No announcements are visible yet.</p>
            ) : null}
          </div>
        </section>

        <section className="table-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconClock size={theme.icon.size.md} /> Leave requests
            </div>
            <div className="table-density">
              {sortedRequests.length} record{sortedRequests.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="data-table-wrap">
            <table className="data-table leave-request-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                  <th>Latest update</th>
                  <th>Tethr note</th>
                </tr>
              </thead>
              <tbody>
                {sortedRequests.map((request) => (
                  <tr key={request.id}>
                    <td>{leaveTypesById.get(request.leaveTypeId)?.name ?? 'Leave'}</td>
                    <td>
                      {formatDate(request.startDate)} - {formatDate(request.endDate)}
                    </td>
                    <td>{request.dayCount.toFixed(1)}</td>
                    <td>
                      <span className="chip" style={chipStyle(requestColor[request.status])}>
                        <span className="chip-dot" />
                        {requestLabel[request.status]}
                      </span>
                    </td>
                    <td>
                      <div className="employee-primary">
                        {request.decidedAt ? 'Decision recorded' : 'Submitted'}
                      </div>
                      <div className="employee-secondary">
                        {formatDateTime(request.decidedAt ?? request.submittedAt)}
                      </div>
                    </td>
                    <td className="truncate">{request.decisionNote ?? request.reason ?? '—'}</td>
                  </tr>
                ))}
                {sortedRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      No leave requests yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <aside className="self-service-panel" aria-label="Employee actions">
        <section className="self-service-section">
          <div className="panel-title-row">
            <div>
              <div className="panel-kicker">Time off</div>
              <h2 className="panel-title">Request leave</h2>
            </div>
            <IconPlaneDeparture size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
          </div>
          <form className="config-form" onSubmit={onLeaveSubmit}>
            {leaveError ? (
              <p className="auth-error" role="alert">
                {leaveError}
              </p>
            ) : null}
            <div className="field">
              <label htmlFor="leave-type">Leave type</label>
              <select
                id="leave-type"
                required
                value={leaveForm.leaveTypeId}
                onChange={(event) =>
                  setLeaveForm((current) => ({ ...current, leaveTypeId: event.target.value }))
                }
              >
                <option value="">Select type</option>
                {data.leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="leave-start">Start date</label>
                <input
                  id="leave-start"
                  required
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(event) =>
                    setLeaveForm((current) => ({ ...current, startDate: event.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="leave-end">End date</label>
                <input
                  id="leave-end"
                  required
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(event) =>
                    setLeaveForm((current) => ({ ...current, endDate: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="leave-reason">Reason</label>
              <textarea
                id="leave-reason"
                value={leaveForm.reason}
                onChange={(event) =>
                  setLeaveForm((current) => ({ ...current, reason: event.target.value }))
                }
              />
            </div>
            <button className="button button-primary" disabled={submittingLeave} type="submit">
              {submittingLeave ? 'Submitting...' : 'Submit request'}
            </button>
          </form>
        </section>

        <section className="self-service-section">
          <div className="panel-title-row">
            <div>
              <div className="panel-kicker">Personal details</div>
              <h2 className="panel-title">Profile</h2>
            </div>
            <IconUserCircle size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
          </div>
          <form className="config-form" onSubmit={onProfileSubmit}>
            {profileNotice ? <p className="form-success">{profileNotice}</p> : null}
            <div className="field">
              <label htmlFor="profile-photo">Photo URL</label>
              <input
                id="profile-photo"
                type="url"
                value={profileForm.photoUrl}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, photoUrl: event.target.value }))
                }
              />
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="profile-email">Personal email</label>
                <input
                  id="profile-email"
                  type="email"
                  value={profileForm.personalEmail}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, personalEmail: event.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="profile-phone">Phone</label>
                <input
                  id="profile-phone"
                  value={profileForm.phone}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, phone: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor="profile-address-1">Address</label>
              <input
                id="profile-address-1"
                value={profileForm.addressLine1}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, addressLine1: event.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="profile-address-2">Address line 2</label>
              <input
                id="profile-address-2"
                value={profileForm.addressLine2}
                onChange={(event) =>
                  setProfileForm((current) => ({ ...current, addressLine2: event.target.value }))
                }
              />
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="profile-city">City</label>
                <input
                  id="profile-city"
                  value={profileForm.city}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, city: event.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="profile-region">Region</label>
                <input
                  id="profile-region"
                  value={profileForm.region}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, region: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="field-group">
              <div className="field">
                <label htmlFor="profile-country">Country code</label>
                <input
                  id="profile-country"
                  maxLength={2}
                  value={profileForm.countryCode}
                  onChange={(event) =>
                    setProfileForm((current) => ({
                      ...current,
                      countryCode: event.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="profile-postal">Postal code</label>
                <input
                  id="profile-postal"
                  value={profileForm.postalCode}
                  onChange={(event) =>
                    setProfileForm((current) => ({ ...current, postalCode: event.target.value }))
                  }
                />
              </div>
            </div>
            <button className="button button-secondary" disabled={savingProfile} type="submit">
              <IconDeviceFloppy size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
              {savingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </form>
        </section>

        <section className="self-service-section">
          <div className="panel-title-row">
            <div>
              <div className="panel-kicker">Feedback</div>
              <h2 className="panel-title">Share feedback</h2>
            </div>
            <IconMessageCircle size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
          </div>
          <form className="config-form" onSubmit={onFeedbackSubmit}>
            {feedbackNotice ? <p className="form-success">{feedbackNotice}</p> : null}
            {feedbackError ? (
              <p className="auth-error" role="alert">
                {feedbackError}
              </p>
            ) : null}
            <div className="field">
              <label htmlFor="feedback-category">Category</label>
              <select
                id="feedback-category"
                value={feedbackForm.category}
                onChange={(event) =>
                  setFeedbackForm((current) => ({ ...current, category: event.target.value }))
                }
              >
                <option value="general">General</option>
                <option value="people">People</option>
                <option value="pay">Pay</option>
                <option value="leave">Leave</option>
                <option value="workplace">Workplace</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="feedback-subject">Subject</label>
              <input
                id="feedback-subject"
                required
                value={feedbackForm.subject}
                onChange={(event) =>
                  setFeedbackForm((current) => ({ ...current, subject: event.target.value }))
                }
              />
            </div>
            <div className="field">
              <label htmlFor="feedback-body">Feedback</label>
              <textarea
                id="feedback-body"
                required
                value={feedbackForm.body}
                onChange={(event) =>
                  setFeedbackForm((current) => ({ ...current, body: event.target.value }))
                }
              />
            </div>
            <button className="button button-secondary" disabled={submittingFeedback} type="submit">
              <IconMessageCircle size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
              {submittingFeedback ? 'Submitting...' : 'Submit feedback'}
            </button>
          </form>
        </section>

        <section className="self-service-section employment-summary">
          <div className="panel-kicker">Employment</div>
          <div className="field-list">
            <div className="field-row">
              <span className="field-label">Joined</span>
              <span className="field-value">{formatDate(employee.hireDate)}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Work email</span>
              <span className="field-value">{employee.workEmail ?? '—'}</span>
            </div>
            <div className="field-row">
              <span className="field-label">Employment type</span>
              <span className="field-value">{employee.workerType}</span>
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
};
