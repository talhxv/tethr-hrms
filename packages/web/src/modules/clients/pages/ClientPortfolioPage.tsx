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
import { CLIENT_WORKSPACES_QUERY, ONBOARD_CLIENT_MUTATION } from '../graphql/client.operations';

type ClientWorkspaceRecord = {
  readonly id: string;
  readonly legalName: string;
  readonly displayName: string;
  readonly kind: string;
  readonly defaultLocale: string;
  readonly defaultCurrency: string;
  readonly createdAt: string;
};

type ClientWorkspacesData = {
  readonly clientWorkspaces: readonly ClientWorkspaceRecord[];
};

const emptyForm = {
  legalName: '',
  displayName: '',
  defaultLocale: 'en',
  defaultCurrency: 'USD',
  adminEmail: '',
  adminPassword: '',
};

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(value),
  );

export const ClientPortfolioPage = () => {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useQuery<ClientWorkspacesData>(CLIENT_WORKSPACES_QUERY);
  const [onboardClient, { loading: onboarding }] = useMutation(ONBOARD_CLIENT_MUTATION);
  const clients = useMemo(() => data?.clientWorkspaces ?? [], [data]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const newestClient = clients[0] ?? null;
  const currencies = new Set(clients.map((client) => client.defaultCurrency)).size;

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
            legalName: form.legalName.trim(),
            displayName: form.displayName.trim() || null,
            defaultLocale: form.defaultLocale.trim() || null,
            defaultCurrency: form.defaultCurrency.trim().toUpperCase(),
            adminEmail: form.adminEmail.trim(),
            adminPassword: form.adminPassword,
          },
        },
      });
      const adminEmail = result.data?.onboardClient.initialAdmin.email;
      setForm(emptyForm);
      setShowForm(false);
      setNotice(adminEmail ? `Client onboarded with admin ${adminEmail}` : 'Client onboarded');
      await refetch();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not onboard this client');
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
            <p className="page-subtitle">Client workspaces onboarded and managed by Tethr Admin.</p>
          </div>
          <div className="page-actions">
            <button
              className="button button-primary"
              type="button"
              onClick={() => setShowForm((visible) => !visible)}
            >
              <IconPlus size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
              New client
            </button>
          </div>
        </header>

        <div className="metric-strip employee-metrics">
          <div className="metric-card">
            <div className="metric-label">Clients</div>
            <div className="metric-value">{loading ? '...' : clients.length}</div>
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
          <div className="metric-card">
            <div className="metric-label">Access</div>
            <div className="metric-value">Admin</div>
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
                <label htmlFor="client-legal-name">Legal name</label>
                <input
                  id="client-legal-name"
                  required
                  value={form.legalName}
                  onChange={(event) => setField('legalName', event.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="client-display-name">Display name</label>
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
            </div>
            <div className="page-actions">
              <button className="button button-primary" disabled={onboarding} type="submit">
                <IconDeviceFloppy size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                {onboarding ? 'Onboarding...' : 'Onboard client'}
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
              Client workspaces
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
            <p className="table-empty">Could not load client workspaces.</p>
          ) : (
            <div className="data-table-wrap">
              <table className="data-table client-portfolio-table">
                <thead>
                  <tr>
                    <th>Client</th>
                    <th>Currency</th>
                    <th>Locale</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id}>
                      <td>
                        <div className="employee-primary">{client.displayName}</div>
                        <div className="employee-secondary">{client.legalName}</div>
                      </td>
                      <td>{client.defaultCurrency}</td>
                      <td>{client.defaultLocale}</td>
                      <td>{formatDate(client.createdAt)}</td>
                    </tr>
                  ))}
                  {!loading && clients.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="table-empty">
                        No client workspaces onboarded yet.
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
              <span className="field-label">First user</span>
              <span className="field-value">Client administrator</span>
            </div>
            <div className="field-row">
              <span className="field-label">Portal</span>
              <span className="field-value">Client</span>
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
