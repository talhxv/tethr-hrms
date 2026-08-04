import { useMutation, useQuery } from '@apollo/client';
import type { ApprovalStatus } from '@hrms/shared';
import type { MainColorName } from '@hrms/ui';
import {
  IconCheck,
  IconClock,
  IconPlaneDeparture,
  IconUserCheck,
  IconX,
} from '@tabler/icons-react';
import { useMemo, useState, type CSSProperties, type FormEvent, type MouseEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import { useAuth } from '../../auth/hooks/useAuth';
import {
  APPROVE_TEAM_LEAVE_REQUEST_MUTATION,
  LEAVE_TRIAGE_QUERY,
  REJECT_TEAM_LEAVE_REQUEST_MUTATION,
} from '../graphql/leave.operations';

type EmployeeRecord = {
  readonly id: string;
  readonly employeeNumber: string;
  readonly firstName: string;
  readonly lastName: string;
};
type LeaveTypeRecord = { readonly id: string; readonly name: string; readonly code: string };
type LeaveRequestRecord = {
  readonly id: string;
  readonly employeeId: string;
  readonly leaveTypeId: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly dayCount: number;
  readonly status: ApprovalStatus;
  readonly reason: string | null;
  readonly submittedAt: string;
  readonly decidedAt: string | null;
  readonly decidedByUserId: string | null;
  readonly decisionNote: string | null;
};
type LeaveTriageData = {
  readonly employees: readonly EmployeeRecord[];
  readonly leaveTypes: readonly LeaveTypeRecord[];
  readonly leaveRequestInbox: readonly LeaveRequestRecord[];
};

const statusLabel: Record<ApprovalStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const statusColor: Record<ApprovalStatus, MainColorName> = {
  pending: 'amber',
  approved: 'green',
  rejected: 'tomato',
  cancelled: 'gray',
};

const chipStyle = (color: MainColorName): CSSProperties & { readonly '--chip-color': string } => ({
  '--chip-color': `var(--hrms-color-tag-${color})`,
});

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );
const formatDateTime = (value: string): string =>
  new Intl.DateTimeFormat('en', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
const fullName = (employee: EmployeeRecord | undefined): string =>
  employee ? `${employee.firstName} ${employee.lastName}` : 'Employee';

export const LeaveTriagePage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const canDecide = user?.portal === 'tethr';
  const { data, loading, error, refetch } = useQuery<LeaveTriageData>(LEAVE_TRIAGE_QUERY);
  const [approveRequest, { loading: approving }] = useMutation(APPROVE_TEAM_LEAVE_REQUEST_MUTATION);
  const [rejectRequest, { loading: rejecting }] = useMutation(REJECT_TEAM_LEAVE_REQUEST_MUTATION);
  const requests = useMemo(() => data?.leaveRequestInbox ?? [], [data]);
  const employees = useMemo(
    () => new Map((data?.employees ?? []).map((employee) => [employee.id, employee])),
    [data?.employees],
  );
  const leaveTypes = useMemo(
    () => new Map((data?.leaveTypes ?? []).map((leaveType) => [leaveType.id, leaveType])),
    [data?.leaveTypes],
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = requests.find((request) => request.id === selectedId) ?? requests[0] ?? null;
  const selectedEmployee = selected ? employees.get(selected.employeeId) : undefined;
  const [note, setNote] = useState('');
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const pendingCount = requests.filter((request) => request.status === 'pending').length;
  const selectedTrail = selected
    ? [
        {
          key: 'employee',
          icon: IconPlaneDeparture,
          title: 'Employee submitted',
          meta: formatDateTime(selected.submittedAt),
          body: selected.reason ?? 'No reason provided.',
        },
        {
          key: 'client',
          icon: IconClock,
          title: user?.portal === 'client' ? 'Client review' : 'Client visibility',
          meta: selected.status === 'pending' ? 'Monitoring pending request' : 'Request visible',
          body:
            user?.portal === 'client'
              ? 'Shared request state for client-side planning.'
              : 'Client can monitor request status without resolving it.',
        },
        {
          key: 'tethr',
          icon: IconUserCheck,
          title: 'Tethr resolution',
          meta: selected.decidedAt ? formatDateTime(selected.decidedAt) : 'Awaiting decision',
          body:
            selected.decisionNote ??
            (selected.status === 'pending' ? 'No decision recorded yet.' : 'No decision note.'),
        },
      ]
    : [];

  const decide = async (action: 'approve' | 'reject'): Promise<void> => {
    if (!selected) return;
    setDecisionError(null);
    try {
      const mutation = action === 'approve' ? approveRequest : rejectRequest;
      await mutation({
        variables: { input: { leaveRequestId: selected.id, note: note || null } },
      });
      setNote('');
      await refetch();
    } catch (caught) {
      setDecisionError(caught instanceof Error ? caught.message : 'Could not update leave request');
    }
  };

  const onApprove = (event: FormEvent): void => {
    event.preventDefault();
    void decide('approve');
  };

  const onReject = (event: MouseEvent<HTMLButtonElement>): void => {
    event.preventDefault();
    void decide('reject');
  };

  return (
    <main className="leave-page">
      <section className="leave-content" aria-labelledby="leave-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="leave-title">
              Leave triage
            </h1>
            <p className="page-subtitle">Team leave requests across employees and clients.</p>
          </div>
        </header>

        <div className="metric-strip employee-metrics">
          <div className="metric-card">
            <div className="metric-label">Pending</div>
            <div className="metric-value">{loading ? '...' : pendingCount}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Approved</div>
            <div className="metric-value">
              {loading ? '...' : requests.filter((request) => request.status === 'approved').length}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Total</div>
            <div className="metric-value">{loading ? '...' : requests.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Mode</div>
            <div className="metric-value">{canDecide ? 'Triage' : 'Monitor'}</div>
          </div>
        </div>

        <section className="table-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconPlaneDeparture size={theme.icon.size.md} /> Requests
            </div>
            <div className="table-density">
              {requests.length} request{requests.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="data-table-wrap">
            <table className="data-table leave-triage-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {error ? (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      Could not load leave requests.
                    </td>
                  </tr>
                ) : null}
                {!error && requests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="table-empty">
                      {loading ? 'Loading leave requests...' : 'No leave requests yet.'}
                    </td>
                  </tr>
                ) : null}
                {requests.map((request) => {
                  const employee = employees.get(request.employeeId);
                  return (
                    <tr
                      className={request.id === selected?.id ? 'is-selected' : ''}
                      key={request.id}
                      onClick={() => setSelectedId(request.id)}
                    >
                      <td>
                        <div className="employee-primary">{fullName(employee)}</div>
                        <div className="employee-secondary">
                          {employee?.employeeNumber ?? request.employeeId}
                        </div>
                      </td>
                      <td>{leaveTypes.get(request.leaveTypeId)?.name ?? 'Leave'}</td>
                      <td>
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </td>
                      <td>{request.dayCount.toFixed(1)}</td>
                      <td>
                        <span className="chip" style={chipStyle(statusColor[request.status])}>
                          <span className="chip-dot" />
                          {statusLabel[request.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <aside className="leave-panel" aria-label="Leave request details">
        {selected ? (
          <section className="self-service-section">
            <div className="panel-title-row">
              <div>
                <div className="panel-kicker">
                  {leaveTypes.get(selected.leaveTypeId)?.name ?? 'Leave'}
                </div>
                <h2 className="panel-title">{fullName(selectedEmployee)}</h2>
              </div>
              <IconPlaneDeparture size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
            </div>

            <div className="field-list">
              <div className="field-row">
                <span className="field-label">Status</span>
                <span className="chip" style={chipStyle(statusColor[selected.status])}>
                  <span className="chip-dot" />
                  {statusLabel[selected.status]}
                </span>
              </div>
              <div className="field-row">
                <span className="field-label">Dates</span>
                <span className="field-value">
                  {formatDate(selected.startDate)} - {formatDate(selected.endDate)}
                </span>
              </div>
              <div className="field-row">
                <span className="field-label">Days</span>
                <span className="field-value">{selected.dayCount.toFixed(1)}</span>
              </div>
            </div>

            <div className="request-note">
              <div className="employee-secondary">Employee reason</div>
              <p>{selected.reason ?? '-'}</p>
            </div>

            <div className="record-list leave-handshake-list">
              {selectedTrail.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="record-item" key={item.key}>
                    <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                    <div>
                      <div className="employee-primary">{item.title}</div>
                      <div className="employee-secondary">{item.meta}</div>
                      <div className="leave-trail-note">{item.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {canDecide && selected.status === 'pending' ? (
              <form className="config-form" onSubmit={onApprove}>
                {decisionError ? (
                  <p className="auth-error" role="alert">
                    {decisionError}
                  </p>
                ) : null}
                <div className="field">
                  <label htmlFor="leave-decision-note">Decision note</label>
                  <textarea
                    id="leave-decision-note"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                  />
                </div>
                <div className="page-actions">
                  <button className="button button-primary" disabled={approving} type="submit">
                    <IconCheck size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                    {approving ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    className="button button-secondary"
                    disabled={rejecting}
                    type="button"
                    onClick={onReject}
                  >
                    <IconX size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                    {rejecting ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </form>
            ) : null}
          </section>
        ) : (
          <p className="page-subtitle">Select a request to review it.</p>
        )}
      </aside>
    </main>
  );
};
