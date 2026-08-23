import { useMutation, useQuery } from '@apollo/client';
import {
  IconBuildingCommunity,
  IconDeviceFloppy,
  IconPlus,
  IconRefresh,
  IconUserShield,
} from '@tabler/icons-react';
import { useMemo, useState, type FormEvent } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import { CLIENTS_QUERY, ONBOARD_CLIENT_MUTATION } from '../graphql/client.operations';

type WorkspaceSummaryRecord = {
  readonly id: string;
  readonly displayName: string;
  readonly defaultCurrency: string;
  readonly defaultLocale: string;
  readonly createdAt: string;
};

type ClientRecord = {
  readonly id: string;
  readonly name: string;
  readonly createdAt: string;
  readonly workspaces: readonly WorkspaceSummaryRecord[];
};

type ClientsData = {
  readonly clients: readonly ClientRecord[];
};

const NEW_CLIENT_OPTION = 'new';

const emptyForm = {
  clientId: NEW_CLIENT_OPTION,
  legalName: '',
  displayName: '',
  defaultLocale: 'en',
  defaultCurrency: 'USD',
  adminEmail: '',
  adminPassword: '',
  hrAdminEmail: '',
  hrAdminPassword: '',
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );

export const ClientPortfolioPage = () => {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useQuery<ClientsData>(CLIENTS_QUERY);
  const [onboardClient, { loading: onboarding }] = useMutation(ONBOARD_CLIENT_MUTATION);
  const clients = useMemo(() => data?.clients ?? [], [data]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const newestClient = clients[0] ?? null;
  const currencies = new Set(
    clients.flatMap((client) => client.workspaces.map((workspace) => workspace.defaultCurrency)),
  ).size;
  const totalWorkspaces = clients.reduce((sum, client) => sum + client.workspaces.length, 0);

  const setField = (key: keyof typeof emptyForm, value: string): void =>
    setForm((current) => ({ ...current, [key]: value }));

  const onSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setFormError(null);
    setNotice(null);
    try {
      const result = await onboardClient({
        variables: {
          input: {
            clientId: form.clientId === NEW_CLIENT_OPTION ? null : form.clientId,
            legalName: form.legalName.trim(),
            displayName: form.displayName.trim() || null,
            defaultLocale: form.defaultLocale.trim() || null,
            defaultCurrency: form.defaultCurrency.trim().toUpperCase(),
            adminEmail: form.adminEmail.trim(),
            adminPassword: form.adminPassword,
            hrAdminEmail: form.hrAdminEmail.trim(),
            hrAdminPassword: form.hrAdminPassword,
          },
        },
      });
      const adminEmail = result.data?.onboardClient.initialAdmin.email;
      const hrAdminEmail = result.data?.onboardClient.initialHrAdmin.email;
      setForm(emptyForm);
      setShowForm(false);
      setNotice(
        adminEmail && hrAdminEmail
          ? `Workspace onboarded with admin ${adminEmail} and Tethr HR ${hrAdminEmail}`
          : 'Workspace onboarded',
      );
      await refetch();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not onboard this workspace');
    }
  };

  return (
    <main className="client-portfolio-page">
      <section className="client-portfolio-content" aria-labelledby="client-portfolio-title">
        <header className="page-header">
          <div>
            <h1 className="page-title" id="client-portfolio-title">
              Client portfolio
            </h1>
            <p className="page-subtitle">Clients and their workspaces, managed by Tethr Admin.</p>
          </div>
          <div className="page-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => setShowForm((visible) => !visible)}
            >
              <IconPlus size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
              New workspace
            </button>
          </div>
        </header>

        <div className="metric-strip employee-metrics">
          <div className="metric-card">
            <div className="metric-label">Clients</div>
            <div className="metric-value">{loading ? '...' : clients.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Workspaces</div>
            <div className="metric-value">{loading ? '...' : totalWorkspaces}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Currencies</div>
            <div className="metric-value">{loading ? '...' : currencies}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Newest</div>
            <div className="metric-value">
              {loading ? '...' : newestClient ? formatDate(newestClient.createdAt) : '-'}
            </div>
          </div>
        </div>

        {notice ? <p className="form-success">{notice}</p> : null}

        {showForm ? (
          <form className="table-shell workspace-user-form" onSubmit={onSubmit}>
            {formError ? (
              <p className="auth-error" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="field-group">
              <div className="field">
                <label htmlFor="client-select">Client</label>
                <select
                  id="client-select"
                  value={form.clientId}
                  onChange={(event) => setField('clientId', event.target.value)}
                >
                  <option value={NEW_CLIENT_OPTION}>+ New client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="client-legal-name">Workspace legal name</label>
                <input
                  id="client-legal-name"
                  required
                  value={form.legalName}
                  onChange={(event) => setField('legalName', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="client-display-name">Workspace display name</label>
                <input
                  id="client-display-name"
                  value={form.displayName}
                  onChange={(event) => setField('displayName', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="client-locale">Locale</label>
                <input
                  id="client-locale"
                  required
                  value={form.defaultLocale}
                  onChange={(event) => setField('defaultLocale', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="client-currency">Currency</label>
                <input
                  id="client-currency"
                  maxLength={3}
                  required
                  value={form.defaultCurrency}
                  onChange={(event) =>
                    setField('defaultCurrency', event.target.value.toUpperCase())
                  }
                />
              </div>
              <div className="field">
                <label htmlFor="client-admin-email">Client admin email</label>
                <input
                  id="client-admin-email"
                  required
                  type="email"
                  value={form.adminEmail}
                  onChange={(event) => setField('adminEmail', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="client-admin-password">Initial password</label>
                <input
                  id="client-admin-password"
                  minLength={8}
                  required
                  type="password"
                  value={form.adminPassword}
                  onChange={(event) => setField('adminPassword', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="client-hr-admin-email">Tethr HR email</label>
                <input
                  id="client-hr-admin-email"
                  required
                  type="email"
                  value={form.hrAdminEmail}
                  onChange={(event) => setField('hrAdminEmail', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="client-hr-admin-password">Tethr HR initial password</label>
                <input
                  id="client-hr-admin-password"
                  minLength={8}
                  required
                  type="password"
                  value={form.hrAdminPassword}
                  onChange={(event) => setField('hrAdminPassword', event.target.value)}
                />
              </div>
            </div>
            <div className="page-actions">
              <button className="button button-primary" disabled={onboarding} type="submit">
                <IconDeviceFloppy size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                {onboarding ? 'Onboarding...' : 'Onboard workspace'}
              </button>
              <button
                className="button button-secondary"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <section className="table-shell">
          <div className="table-title-row">
            <div className="table-title">
              <IconBuildingCommunity size={theme.icon.size.md} />
              Clients
            </div>
            <button
              className="icon-button"
              onClick={() => void refetch()}
              title="Refresh clients"
              type="button"
            >
              <IconRefresh size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            </button>
          </div>
          {error ? (
            <p className="table-empty">Could not load clients.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table client-portfolio-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Workspaces</th>
                    <th>Currencies</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="employee-primary">{client.name}</div>
                      </td>
                      <td>
                        {client.workspaces.length === 0
                          ? '-'
                          : client.workspaces.map((workspace) => workspace.displayName).join(', ')}
                      </td>
                      <td>
                        {Array.from(
                          new Set(client.workspaces.map((workspace) => workspace.defaultCurrency)),
                        ).join(', ') || '-'}
                      </td>
                      <td>{formatDate(client.createdAt)}</td>
                    </tr>
                  ))}
                  {!loading && clients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        No clients onboarded yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </section>

      <aside className="client-portfolio-panel" aria-label="Client onboarding summary">
        <section className="self-service-section">
          <div className="panel-title-row">
            <div>
              <div className="panel-kicker">Onboarding</div>
              <h2 className="panel-title">Client setup</h2>
            </div>
            <IconUserShield size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
          </div>
          <div className="field-list">
            <div className="field-row">
              <span className="field-label">Client user</span>
              <span className="field-value">Client administrator (view + approve)</span>
            </div>
            <div className="field-row">
              <span className="field-label">Tethr user</span>
              <span className="field-value">Tethr administrator (runs HR ops)</span>
            </div>
            <div className="field-row">
              <span className="field-label">Portal</span>
              <span className="field-value">Client + Tethr</span>
            </div>
            <div className="field-row">
              <span className="field-label">Next step</span>
              <span className="field-value">Add teammates</span>
            </div>
          </div>
        </section>
      </aside>
    </main>
  );
};
