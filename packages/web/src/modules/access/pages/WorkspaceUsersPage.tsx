import { useMutation, useQuery } from '@apollo/client';
import type { SystemRoleKey } from '@hrms/shared';
import { IconKey, IconPlus, IconRefresh, IconUsersGroup } from '@tabler/icons-react';
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import {
  ASSIGNABLE_WORKSPACE_ROLES_QUERY,
  CREATE_WORKSPACE_USER_MUTATION,
  UPDATE_WORKSPACE_USER_ROLE_MUTATION,
  WORKSPACE_USERS_QUERY,
} from '../../auth/graphql/auth.operations';
import { EMPLOYEES_QUERY } from '../../employees/graphql/employee.operations';

type WorkspaceUser = {
  readonly id: string;
  readonly email: string;
  readonly status: string;
  readonly employeeId: string | null;
  readonly roleKeys: readonly string[];
  readonly portal: string;
};

type WorkspaceUsersData = { readonly workspaceUsers: readonly WorkspaceUser[] };
type AssignableWorkspaceRolesData = { readonly assignableWorkspaceRoles: readonly string[] };
type EmployeeOption = {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly employeeNumber: string;
};
type EmployeesData = { readonly employees: readonly EmployeeOption[] };

const roleLabels: Record<SystemRoleKey, string> = {
  tethrAdmin: 'Tethr administrator',
  tethrHr: 'Tethr HR',
  clientAdmin: 'Client administrator',
  clientMember: 'Client member',
  employee: 'Employee',
};

const isSystemRoleKey = (value: string): value is SystemRoleKey =>
  Object.prototype.hasOwnProperty.call(roleLabels, value);

const primarySystemRole = (roleKeys: readonly string[]): SystemRoleKey | null =>
  roleKeys.find(isSystemRoleKey) ?? null;

export const WorkspaceUsersPage = () => {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useQuery<WorkspaceUsersData>(WORKSPACE_USERS_QUERY);
  const { data: assignableRoleData, loading: loadingAssignableRoles } =
    useQuery<AssignableWorkspaceRolesData>(ASSIGNABLE_WORKSPACE_ROLES_QUERY);
  const { data: employeeData } = useQuery<EmployeesData>(EMPLOYEES_QUERY);
  const [createUser, { loading: creating }] = useMutation(CREATE_WORKSPACE_USER_MUTATION);
  const [updateUserRole, { loading: updatingRole }] = useMutation(
    UPDATE_WORKSPACE_USER_ROLE_MUTATION,
  );
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    roleKey: 'clientMember' as SystemRoleKey,
    employeeId: '',
  });
  const [roleDrafts, setRoleDrafts] = useState<Record<string, SystemRoleKey>>({});
  const [employeeLinkDrafts, setEmployeeLinkDrafts] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const assignableRoles = useMemo(
    () => (assignableRoleData?.assignableWorkspaceRoles ?? []).filter(isSystemRoleKey),
    [assignableRoleData?.assignableWorkspaceRoles],
  );
  const firstAssignableRole = assignableRoles[0] ?? null;
  const employeesById = useMemo(
    () => new Map((employeeData?.employees ?? []).map((employee) => [employee.id, employee])),
    [employeeData?.employees],
  );

  useEffect(() => {
    if (!firstAssignableRole) return;
    setForm((current) =>
      assignableRoles.includes(current.roleKey)
        ? current
        : { ...current, roleKey: firstAssignableRole, employeeId: '' },
    );
  }, [assignableRoles, firstAssignableRole]);

  const onCreate = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (assignableRoles.length === 0) return;
    setFormError(null);
    try {
      await createUser({
        variables: {
          input: {
            email: form.email,
            password: form.password,
            roleKey: form.roleKey,
            employeeId: form.employeeId || undefined,
          },
        },
      });
      setForm({ email: '', password: '', roleKey: 'clientMember', employeeId: '' });
      setShowForm(false);
      await refetch();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not add this user');
    }
  };

  const onUpdateRole = async (workspaceUser: WorkspaceUser): Promise<void> => {
    const currentRole = primarySystemRole(workspaceUser.roleKeys);
    const nextRole = roleDrafts[workspaceUser.id] ?? currentRole;
    const nextEmployeeId = employeeLinkDrafts[workspaceUser.id] ?? workspaceUser.employeeId ?? '';
    const employeeLinkChanged =
      nextRole === 'employee' && nextEmployeeId !== (workspaceUser.employeeId ?? '');
    if (!nextRole || (nextRole === currentRole && !employeeLinkChanged)) return;
    if (nextRole === 'employee' && !nextEmployeeId) {
      setRoleError('Select an employee record before assigning employee access');
      return;
    }
    setRoleError(null);
    try {
      await updateUserRole({
        variables: {
          input: {
            userId: workspaceUser.id,
            roleKey: nextRole,
            employeeId: nextRole === 'employee' ? nextEmployeeId : undefined,
          },
        },
      });
      setRoleDrafts((current) => {
        const next = { ...current };
        delete next[workspaceUser.id];
        return next;
      });
      setEmployeeLinkDrafts((current) => {
        const next = { ...current };
        delete next[workspaceUser.id];
        return next;
      });
      await refetch();
    } catch (caught) {
      setRoleError(caught instanceof Error ? caught.message : 'Could not update this role');
    }
  };

  return (
    <main className="workspace-users-page">
      <section className="workspace-users-content" aria-labelledby="workspace-users-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="workspace-users-title">
              Workspace users
            </h1>
            <p className="page-subtitle">
              People with access to this organization and their active roles.
            </p>
          </div>
          <button
            className="button button-primary"
            onClick={() => setShowForm((visible) => !visible)}
            type="button"
          >
            <IconPlus size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            Add user
          </button>
        </header>

        {showForm ? (
          <form className="table-shell workspace-user-form" onSubmit={onCreate}>
            {formError ? (
              <p className="auth-error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="field-group">
              <div className="field">
                <label htmlFor="workspace-user-email">Email</label>
                <input
                  id="workspace-user-email"
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, email: event.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="workspace-user-password">Initial password</label>
                <input
                  id="workspace-user-password"
                  required
                  minLength={8}
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, password: event.target.value }))
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="workspace-user-role">Access role</label>
                <select
                  id="workspace-user-role"
                  disabled={assignableRoles.length === 0}
                  value={form.roleKey}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      roleKey: event.target.value as SystemRoleKey,
                      employeeId: '',
                    }))
                  }
                >
                  {assignableRoles.length === 0 ? (
                    <option value={form.roleKey}>
                      {loadingAssignableRoles ? 'Loading roles...' : 'No assignable roles'}
                    </option>
                  ) : null}
                  {assignableRoles.map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="workspace-user-employee">Employee record</label>
                <select
                  id="workspace-user-employee"
                  required={form.roleKey === 'employee'}
                  disabled={form.roleKey !== 'employee'}
                  value={form.employeeId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, employeeId: event.target.value }))
                  }
                >
                  <option value="">
                    {form.roleKey === 'employee' ? 'Select employee' : 'Not required'}
                  </option>
                  {(employeeData?.employees ?? []).map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="page-actions">
              <button
                className="button button-primary"
                disabled={creating || assignableRoles.length === 0}
                type="submit"
              >
                <IconKey size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                {creating ? 'Adding...' : 'Add user'}
              </button>
              <button
                className="button button-secondary"
                onClick={() => setShowForm(false)}
                type="button"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        {roleError ? (
          <p className="auth-error" role="alert">
            {roleError}
          </p>
        ) : null}

        <section className="table-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconUsersGroup size={theme.icon.size.md} />
              Users
            </div>
            <button
              className="icon-button"
              onClick={() => void refetch()}
              title="Refresh users"
              type="button"
            >
              <IconRefresh size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            </button>
          </div>
          {error ? (
            <p className="table-empty">Could not load workspace users.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Employee record</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.workspaceUsers ?? []).map((workspaceUser) => (
                    <tr key={workspaceUser.id}>
                      <td>{workspaceUser.email}</td>
                      <td>
                        {(() => {
                          const currentRole = primarySystemRole(workspaceUser.roleKeys);
                          const assignableForUser = assignableRoles;
                          const canEditRole =
                            assignableForUser.length > 0 &&
                            (currentRole === null || assignableForUser.includes(currentRole));
                          const selectedRole =
                            roleDrafts[workspaceUser.id] ??
                            currentRole ??
                            assignableForUser[0] ??
                            'clientMember';
                          const selectedEmployeeId =
                            employeeLinkDrafts[workspaceUser.id] ?? workspaceUser.employeeId ?? '';
                          const hasRoleChange =
                            currentRole === null ||
                            selectedRole !== currentRole ||
                            (selectedRole === 'employee' &&
                              selectedEmployeeId !== (workspaceUser.employeeId ?? ''));

                          return canEditRole ? (
                            <div
                              className={`access-role-control${
                                selectedRole === 'employee' ? '' : ' is-role-only'
                              }`}
                            >
                              <select
                                aria-label={`Access role for ${workspaceUser.email}`}
                                value={selectedRole}
                                onChange={(event) =>
                                  setRoleDrafts((current) => ({
                                    ...current,
                                    [workspaceUser.id]: event.target.value as SystemRoleKey,
                                  }))
                                }
                              >
                                {assignableForUser.map((role) => (
                                  <option key={role} value={role}>
                                    {roleLabels[role]}
                                  </option>
                                ))}
                              </select>
                              {selectedRole === 'employee' ? (
                                <select
                                  aria-label={`Employee record for ${workspaceUser.email}`}
                                  value={selectedEmployeeId}
                                  onChange={(event) =>
                                    setEmployeeLinkDrafts((current) => ({
                                      ...current,
                                      [workspaceUser.id]: event.target.value,
                                    }))
                                  }
                                >
                                  <option value="">Select employee</option>
                                  {(employeeData?.employees ?? []).map((employee) => (
                                    <option key={employee.id} value={employee.id}>
                                      {employee.firstName} {employee.lastName} (
                                      {employee.employeeNumber})
                                    </option>
                                  ))}
                                </select>
                              ) : null}
                              <button
                                className="button button-secondary"
                                disabled={
                                  !hasRoleChange ||
                                  updatingRole ||
                                  (selectedRole === 'employee' && !selectedEmployeeId)
                                }
                                onClick={() => void onUpdateRole(workspaceUser)}
                                type="button"
                              >
                                <IconKey size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                                Save
                              </button>
                            </div>
                          ) : (
                            <span className="access-role-static">
                              {currentRole ? roleLabels[currentRole] : 'No assignable role'}
                            </span>
                          );
                        })()}
                      </td>
                      <td>
                        {workspaceUser.employeeId
                          ? (() => {
                              const employee = employeesById.get(workspaceUser.employeeId);
                              return employee
                                ? `${employee.firstName} ${employee.lastName} (${employee.employeeNumber})`
                                : workspaceUser.employeeId;
                            })()
                          : '—'}
                      </td>
                      <td>
                        <span
                          className="chip"
                          style={{ '--chip-color': 'var(--hrms-color-tag-green)' } as CSSProperties}
                        >
                          <span className="chip-dot" />
                          {workspaceUser.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && (data?.workspaceUsers.length ?? 0) === 0 ? (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        No workspace users found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>
    </main>
  );
};
