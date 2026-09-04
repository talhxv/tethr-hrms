import { useMutation, useQuery } from '@apollo/client';
import type { WorkerType } from '@hrms/shared';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconPlus,
  IconSearch,
  IconUserCheck,
  IconUserPlus,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { ActionMenu } from '../../../components/menu/ActionMenu';
import { useTheme } from '../../../providers/theme/useTheme';
import { useAuth } from '../../auth/hooks/useAuth';
import { DirectoryFilterMenu } from '../components/DirectoryFilterMenu';
import {
  EmployeeOnboardingForm,
  type EmployeeOnboardingFormValues,
} from '../components/EmployeeOnboardingForm';
import { EmployeeOrgChart } from '../components/EmployeeOrgChart';
import {
  chipStyle,
  colorFor,
  daysSince,
  formatDate,
  fullName,
  initials,
  statusColors,
  statusLabels,
  workerTypeLabels,
  type CreateEmployeeData,
  type EmployeeRecord,
  type EmployeesData,
} from '../employee.shared';
import { CREATE_EMPLOYEE_MUTATION, EMPLOYEES_QUERY } from '../graphql/employee.operations';

// Shortcuts in the "Onboard employee" menu — the rest stay reachable from the
// worker type field inside the flow.
const QUICK_WORKER_TYPES: readonly WorkerType[] = ['permanent', 'contractor', 'fixedTerm'];

const emptyForm: EmployeeOnboardingFormValues = {
  employeeNumber: '',
  firstName: '',
  middleName: '',
  lastName: '',
  salutation: '',
  hireDate: '',
  workEmail: '',
  roleTitle: '',
  dateOfBirth: '',
  probationEndDate: '',
  scheduledConfirmationDate: '',
  finalConfirmationDate: '',
  contractEndDate: '',
  noticePeriodDays: '',
  retirementDate: '',
  holidayCalendarId: '',
  workerType: 'permanent',
};

export const EmployeesListPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery<EmployeesData>(EMPLOYEES_QUERY);
  const [createEmployee, { loading: creating }] =
    useMutation<CreateEmployeeData>(CREATE_EMPLOYEE_MUTATION);

  const employees = useMemo(() => data?.employees ?? [], [data]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The org chart is its own sub-nav tab, so the view follows the route rather
  // than local state — both views share the preview rail below.
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const viewMode: 'directory' | 'orgChart' = pathname.endsWith('/org-chart')
    ? 'orgChart'
    : 'directory';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<readonly string[]>([]);
  const [workerTypeFilter, setWorkerTypeFilter] = useState<readonly string[]>([]);
  const [showForm, setShowForm] = useState(false);
  // Which worker type the onboarding flow opens prefilled with, chosen from the
  // "Onboard employee" menu. Null means start on the default (permanent).
  const [pendingWorkerType, setPendingWorkerType] = useState<WorkerType | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const startOnboarding = (workerType?: WorkerType): void => {
    setPendingWorkerType(workerType ?? null);
    setFormError(null);
    setShowForm(true);
  };

  const visibleEmployees = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    return employees.filter((employee) => {
      if (statusFilter.length > 0 && !statusFilter.includes(employee.employmentStatus)) {
        return false;
      }
      if (workerTypeFilter.length > 0 && !workerTypeFilter.includes(employee.workerType)) {
        return false;
      }
      if (needle === '') return true;
      return [
        fullName(employee),
        employee.employeeNumber,
        employee.workEmail ?? '',
        employee.roleTitle ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [employees, searchTerm, statusFilter, workerTypeFilter]);

  const filtersActive =
    searchTerm.trim() !== '' || statusFilter.length > 0 || workerTypeFilter.length > 0;

  const clearFilters = (): void => {
    setSearchTerm('');
    setStatusFilter([]);
    setWorkerTypeFilter([]);
  };

  const selected: EmployeeRecord | null =
    employees.find((employee) => employee.id === selectedId) ?? null;
  const isTethrWorkspace = user?.portal === 'tethr';
  const canOnboardEmployee = Boolean(
    user?.roleKeys.includes('tethrAdmin') || user?.roleKeys.includes('tethrHr'),
  );

  const onCreate = async (values: EmployeeOnboardingFormValues): Promise<void> => {
    if (!canOnboardEmployee) return;
    setFormError(null);
    try {
      const result = await createEmployee({
        variables: {
          input: {
            employeeNumber: values.employeeNumber,
            firstName: values.firstName,
            middleName: values.middleName || undefined,
            lastName: values.lastName,
            salutation: values.salutation || undefined,
            hireDate: values.hireDate,
            workEmail: values.workEmail ? values.workEmail : undefined,
            roleTitle: values.roleTitle ? values.roleTitle : undefined,
            dateOfBirth: values.dateOfBirth ? values.dateOfBirth : undefined,
            probationEndDate: values.probationEndDate ? values.probationEndDate : undefined,
            scheduledConfirmationDate: values.scheduledConfirmationDate || undefined,
            finalConfirmationDate: values.finalConfirmationDate || undefined,
            contractEndDate: values.contractEndDate || undefined,
            noticePeriodDays: values.noticePeriodDays ? Number(values.noticePeriodDays) : undefined,
            retirementDate: values.retirementDate || undefined,
            holidayCalendarId: values.holidayCalendarId || undefined,
            workerType: values.workerType,
          },
        },
      });
      await refetch();
      setShowForm(false);
      if (result.data) {
        setSelectedId(result.data.createEmployee.id);
      }
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not create employee');
    }
  };

  // Onboarding takes over the whole page rather than sitting as a strip above the
  // directory: the intake is a task in its own right, and competing with the table
  // plus the preview rail is what made it feel cramped.
  if (showForm && canOnboardEmployee) {
    return (
      <main className="onboarding-page">
        <EmployeeOnboardingForm
          formError={formError}
          initialValues={
            pendingWorkerType ? { ...emptyForm, workerType: pendingWorkerType } : emptyForm
          }
          submitting={creating}
          workerTypeLabels={workerTypeLabels}
          onCancel={() => setShowForm(false)}
          onSubmit={(values) => void onCreate(values)}
        />
      </main>
    );
  }

  return (
    // The org chart needs the whole page: with the preview rail taking 500px it
    // renders a 2700px tree into ~780px. Selection there opens the record instead.
    <main className={viewMode === 'orgChart' ? 'page-frame-wide' : 'page-frame'}>
      <section className="employees-content" aria-labelledby="employees-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="employees-title">
              {viewMode === 'orgChart' ? 'Org chart' : 'Employees'}
            </h1>
            <p className="page-subtitle">
              {viewMode === 'orgChart'
                ? 'Reporting lines across the workspace. Select anyone to open their record.'
                : isTethrWorkspace
                  ? 'Onboard employees and maintain client-facing workforce records.'
                  : 'Review employee data, documents, pay, assessments, and bonuses.'}
            </p>
          </div>
          {canOnboardEmployee ? (
            <div className="page-actions">
              <ActionMenu
                icon={IconPlus}
                label="Onboard employee"
                sections={[
                  {
                    key: 'start',
                    items: [
                      {
                        key: 'blank',
                        label: 'Add one person',
                        description: 'Full intake, worker type set on the way through',
                        icon: IconUserPlus,
                        onSelect: () => startOnboarding(),
                      },
                    ],
                  },
                  {
                    key: 'worker-types',
                    label: 'Frequently used',
                    items: QUICK_WORKER_TYPES.map((workerType) => ({
                      key: workerType,
                      label: workerTypeLabels[workerType],
                      icon: IconUserPlus,
                      onSelect: () => startOnboarding(workerType),
                    })),
                  },
                ]}
              />
            </div>
          ) : null}
        </header>

        <div className="directory-toolbar">
          <div className="directory-search">
            <IconSearch size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            <input
              aria-label="Search employees"
              placeholder="Search name, number, email, or role"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
          <DirectoryFilterMenu
            label="Status"
            options={Object.entries(statusLabels).map(([value, label]) => ({ value, label }))}
            selected={statusFilter}
            onChange={setStatusFilter}
          />
          <DirectoryFilterMenu
            label="Worker type"
            options={Object.entries(workerTypeLabels).map(([value, label]) => ({ value, label }))}
            selected={workerTypeFilter}
            onChange={setWorkerTypeFilter}
          />
          {filtersActive ? (
            <button className="link-button directory-clear" type="button" onClick={clearFilters}>
              Clear all
            </button>
          ) : null}
          <span className="directory-count">
            {loading
              ? 'Loading…'
              : filtersActive
                ? `${visibleEmployees.length} of ${employees.length} people`
                : `Total ${employees.length} ${employees.length === 1 ? 'person' : 'people'}`}
          </span>
        </div>

        <div className="table-shell">
          {error ? (
            <div className="directory-empty">
              <IconAlertTriangle size={theme.icon.size.xl} stroke={theme.icon.stroke.md} />
              <h2 className="directory-empty-title">Could not load employees</h2>
              <p>Is the API running, and are you still signed in?</p>
            </div>
          ) : !loading && employees.length === 0 ? (
            <div className="directory-empty">
              <IconUsersGroup size={theme.icon.size.xl} stroke={theme.icon.stroke.md} />
              <h2 className="directory-empty-title">No employees yet</h2>
              <p>
                {canOnboardEmployee
                  ? 'Onboard your first employee to start building the directory.'
                  : 'No employees are available in this workspace yet.'}
              </p>
              {canOnboardEmployee ? (
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => startOnboarding()}
                >
                  <IconPlus size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                  Onboard employee
                </button>
              ) : null}
            </div>
          ) : !loading && visibleEmployees.length === 0 ? (
            <div className="directory-empty">
              <IconSearch size={theme.icon.size.xl} stroke={theme.icon.stroke.md} />
              <h2 className="directory-empty-title">No result</h2>
              <p>Adjust your search or filters to show the people in this workspace.</p>
              <button className="button button-secondary" type="button" onClick={clearFilters}>
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'orgChart' ? (
            <EmployeeOrgChart
              employees={visibleEmployees}
              selectedId={selectedId}
              onSelect={(employeeId) => navigate(`/employees/${employeeId}`)}
            />
          ) : (
            <div className="employee-table-wrap">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Work email</th>
                    <th>Role</th>
                    <th>Hire date</th>
                    <th>Status</th>
                    <th>Worker type</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      aria-selected={selected?.id === employee.id}
                      className={`employee-row${selected?.id === employee.id ? ' is-selected' : ''}`}
                      onClick={() => setSelectedId(employee.id)}
                    >
                      <td>
                        <div className="employee-name-cell">
                          <span
                            className="employee-avatar"
                            style={chipStyle(colorFor(employee.id))}
                          >
                            {initials(employee)}
                          </span>
                          <div className="truncate">
                            {/* A real link, not just the row click: the preview
                                rail is hidden below 1100px, so on a phone this
                                is the only route into the record. */}
                            <Link
                              className="employee-primary employee-name-link"
                              to={`/employees/${employee.id}`}
                            >
                              {fullName(employee)}
                            </Link>
                            <div className="employee-secondary">{employee.employeeNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td className="truncate" data-label="Work email">{employee.workEmail ?? '—'}</td>
                      <td className="truncate" data-label="Role">{employee.roleTitle ?? '—'}</td>
                      <td className="truncate" data-label="Hire date">{formatDate(employee.hireDate)}</td>
                      <td data-label="Status">
                        <span
                          className="chip"
                          style={chipStyle(statusColors[employee.employmentStatus])}
                        >
                          <span className="chip-dot" />
                          {statusLabels[employee.employmentStatus]}
                        </span>
                      </td>
                      <td data-label="Worker type">{workerTypeLabels[employee.workerType]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Preview only. Everything beyond these headline facts lives on the
          profile page, which has the width for it. */}
      {viewMode === 'orgChart' ? null : (
      <aside className="employee-detail-panel" aria-label="Selected employee preview">
        {selected ? (
          <>
            <div className="preview-identity">
              <span className="employee-avatar" style={chipStyle(colorFor(selected.id))}>
                {initials(selected)}
              </span>
              <div className="truncate">
                <div className="panel-kicker">Selected employee</div>
                <h2 className="panel-title">{fullName(selected)}</h2>
                <div className="employee-meta">{selected.employeeNumber}</div>
              </div>
            </div>

            <span
              className="chip preview-status"
              style={chipStyle(statusColors[selected.employmentStatus])}
            >
              <span className="chip-dot" />
              {statusLabels[selected.employmentStatus]}
            </span>

            <div className="field-list preview-facts">
              <div className="field-row">
                <span className="field-label">Role</span>
                <span className="field-value">{selected.roleTitle ?? '—'}</span>
              </div>
              <div className="field-row">
                <span className="field-label">Worker type</span>
                <span className="field-value">{workerTypeLabels[selected.workerType]}</span>
              </div>
              <div className="field-row">
                <span className="field-label">Hire date</span>
                <span className="field-value">{formatDate(selected.hireDate)}</span>
              </div>
              <div className="field-row">
                <span className="field-label">Days since joining</span>
                <span className="field-value">{daysSince(selected.hireDate)}</span>
              </div>
              <div className="field-row">
                <span className="field-label">Department</span>
                <span className="field-value">
                  {selected.currentAssignment?.departmentName ?? '—'}
                </span>
              </div>
              <div className="field-row">
                <span className="field-label">Manager</span>
                <span className="field-value">
                  {selected.currentAssignment?.reportsToName ?? '—'}
                </span>
              </div>
            </div>

            <Link className="button button-primary button-full" to={`/employees/${selected.id}`}>
              Open record
              <IconArrowRight size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            </Link>
          </>
        ) : (
          <div className="detail-panel-empty">
            <IconUserCheck size={theme.icon.size.lg} stroke={theme.icon.stroke.md} />
            <p>Select an employee from the directory to preview them.</p>
          </div>
        )}
      </aside>
      )}
    </main>
  );
};
