import { useQuery } from '@apollo/client';
import type { EmploymentStatus } from '@hrms/shared';
import type { MainColorName } from '@hrms/ui';
import {
  IconArrowUpRight,
  IconBriefcase,
  IconChecklist,
  IconCircleCheck,
  IconCurrencyDollar,
  IconLock,
  IconUserPlus,
  IconUsersGroup,
  type TablerIcon,
} from '@tabler/icons-react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { useTheme } from '../../../providers/theme/useTheme';
import { useAuth } from '../../auth/hooks/useAuth';
import { CLIENT_WORKSPACE_QUERY } from '../graphql/client-workspace.operations';

type EmployeeRecord = {
  readonly id: string;
  readonly employeeNumber: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly workEmail: string | null;
  readonly hireDate: string;
  readonly employmentStatus: EmploymentStatus;
  readonly workerType: string;
};

type HiringRequestRecord = {
  readonly id: string;
  readonly status: string;
  readonly updatedAt: string;
};
type SalaryStructureRecord = { readonly id: string };
type ClientWorkspaceData = {
  readonly employees: readonly EmployeeRecord[];
  readonly hiringRequests: readonly HiringRequestRecord[];
  readonly salaryStructures: readonly SalaryStructureRecord[];
};
type OnboardingStep = {
  readonly title: string;
  readonly detail: string;
  readonly to: string;
  readonly icon: TablerIcon;
  readonly complete: boolean;
  readonly disabled?: boolean;
};

const statusColors: Record<EmploymentStatus, MainColorName> = {
  active: 'green',
  onLeave: 'amber',
  suspended: 'tomato',
  terminated: 'gray',
};

const statusLabels: Record<EmploymentStatus, string> = {
  active: 'Active',
  onLeave: 'On leave',
  suspended: 'Suspended',
  terminated: 'Terminated',
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(`${value}T00:00:00`),
  );

export const ClientWorkspacePage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data, loading, error } = useQuery<ClientWorkspaceData>(CLIENT_WORKSPACE_QUERY);
  const employees = data?.employees ?? [];
  const hiringRequests = data?.hiringRequests ?? [];
  const salaryStructures = data?.salaryStructures ?? [];
  const activeEmployees = employees.filter(
    (employee) => employee.employmentStatus === 'active',
  ).length;
  const onLeaveEmployees = employees.filter(
    (employee) => employee.employmentStatus === 'onLeave',
  ).length;
  const activeHiringRequests = hiringRequests.filter(
    (request) => request.status !== 'filled' && request.status !== 'cancelled',
  ).length;
  const compensationReady = salaryStructures.length > 0;
  const isClientAdmin = user?.roleKeys.includes('clientAdmin') === true;
  const onboardingSteps: readonly OnboardingStep[] = [
    {
      title: 'Review employee records',
      detail: employees.length > 0 ? `${employees.length} employees available` : 'Waiting on setup',
      to: '/employees',
      icon: IconUsersGroup,
      complete: employees.length > 0,
    },
    {
      title: 'Post hiring request',
      detail:
        hiringRequests.length > 0
          ? `${hiringRequests.length} request${hiringRequests.length === 1 ? '' : 's'} tracked`
          : 'Submit new roles for Tethr intake',
      to: '/hiring',
      icon: IconBriefcase,
      complete: hiringRequests.length > 0,
    },
    {
      title: 'Manage teammates',
      detail: isClientAdmin ? 'Invite and manage workspace users' : 'Client admin only',
      to: '/users',
      icon: IconUserPlus,
      complete: isClientAdmin,
      disabled: !isClientAdmin,
    },
    {
      title: 'Review compensation',
      detail: isClientAdmin
        ? compensationReady
          ? `${salaryStructures.length} salary structure${salaryStructures.length === 1 ? '' : 's'} available`
          : 'Salary history and adjustments'
        : 'Client admin only',
      to: '/compensation',
      icon: IconCurrencyDollar,
      complete: isClientAdmin && compensationReady,
      disabled: !isClientAdmin,
    },
  ];

  return (
    <main className="client-workspace">
      <section className="client-workspace-content" aria-labelledby="client-workspace-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="client-workspace-title">
              People overview
            </h1>
            <p className="page-subtitle">Your workforce and the actions that affect it.</p>
          </div>
        </header>

        <div className="metric-strip client-metrics">
          <div className="metric-card">
            <div className="metric-label">Total employees</div>
            <div className="metric-value">{loading ? '—' : employees.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Active</div>
            <div className="metric-value">{loading ? '—' : activeEmployees}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">On leave</div>
            <div className="metric-value">{loading ? '—' : onLeaveEmployees}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Hiring requests</div>
            <div className="metric-value">{loading ? '—' : activeHiringRequests}</div>
          </div>
        </div>

        <section className="table-shell client-onboarding" aria-labelledby="client-onboarding">
          <div className="table-title-row">
            <div className="table-title" id="client-onboarding">
              <IconChecklist size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
              Client onboarding
            </div>
            <div className="table-density">
              {onboardingSteps.filter((step) => step.complete).length}/{onboardingSteps.length}{' '}
              ready
            </div>
          </div>
          <div className="onboarding-step-list">
            {onboardingSteps.map((step) => {
              const StepIcon = step.icon;
              const StatusIcon = step.disabled
                ? IconLock
                : step.complete
                  ? IconCircleCheck
                  : IconArrowUpRight;
              const content = (
                <>
                  <span className="onboarding-step-icon">
                    <StepIcon size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                  </span>
                  <span className="onboarding-step-copy">
                    <span className="employee-primary">{step.title}</span>
                    <span className="employee-secondary">{step.detail}</span>
                  </span>
                  <span className="onboarding-step-status">
                    <StatusIcon size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                  </span>
                </>
              );

              return step.disabled ? (
                <div className="onboarding-step is-disabled" key={step.title}>
                  {content}
                </div>
              ) : (
                <Link className="onboarding-step" key={step.title} to={step.to}>
                  {content}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="table-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconUsersGroup size={theme.icon.size.md} /> Employees
            </div>
            <Link className="button button-secondary" to="/employees">
              View directory{' '}
              <IconArrowUpRight size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
            </Link>
          </div>
          {error ? (
            <p className="table-empty">
              Could not load employees. Check that the API is running and this account has client
              access.
            </p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table client-employee-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Work email</th>
                    <th>Joined</th>
                    <th>Employment</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.slice(0, 8).map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="employee-primary">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="employee-secondary">{employee.employeeNumber}</div>
                      </td>
                      <td>{employee.workEmail ?? '—'}</td>
                      <td>{formatDate(employee.hireDate)}</td>
                      <td>
                        <span
                          className="chip"
                          style={
                            {
                              '--chip-color': `var(--hrms-color-tag-${statusColors[employee.employmentStatus]})`,
                            } as CSSProperties
                          }
                        >
                          <span className="chip-dot" />
                          {statusLabels[employee.employmentStatus]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && employees.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        No employees are available in this workspace yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <aside className="client-workspace-panel" aria-label="Client actions">
        <section className="client-action-block">
          <div className="panel-kicker">People operations</div>
          <h2 className="panel-title">Manage your team</h2>
          <p>
            Review employment records, statuses, and core details for everyone in your organization.
          </p>
          <Link className="button button-primary" to="/employees">
            <IconUsersGroup size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            Open employee directory
          </Link>
        </section>
        <section className="client-action-block">
          <div className="panel-kicker">Hiring</div>
          <h2 className="panel-title">Request a role</h2>
          <p>
            Submit a hiring brief and follow Tethr&apos;s progress from intake through fulfillment.
          </p>
          <Link className="button button-secondary" to="/hiring">
            <IconBriefcase size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            Open hiring requests
          </Link>
        </section>
        {isClientAdmin ? (
          <section className="client-action-block">
            <div className="panel-kicker">Workspace access</div>
            <h2 className="panel-title">Invite teammates</h2>
            <p>Add client members and link employee self-service users to employee records.</p>
            <Link className="button button-secondary" to="/users">
              <IconUserPlus size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
              Open users
            </Link>
          </section>
        ) : null}
        {isClientAdmin ? (
          <section className="client-action-block">
            <div className="panel-kicker">Compensation</div>
            <h2 className="panel-title">Salary changes</h2>
            <p>Review salary history and record approved adjustments for your workforce.</p>
            <Link className="button button-secondary" to="/compensation">
              <IconCurrencyDollar size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
              Open compensation
            </Link>
          </section>
        ) : null}
      </aside>
    </main>
  );
};
