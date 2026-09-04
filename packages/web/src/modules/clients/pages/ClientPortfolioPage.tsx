import { useMutation, useQuery } from '@apollo/client';
import { IconBuildingCommunity, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import { useTheme } from '../../../providers/theme/useTheme';
import {
  NEW_CLIENT_OPTION,
  WorkspaceOnboardingForm,
  type WorkspaceOnboardingFormValues,
} from '../components/WorkspaceOnboardingForm';
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

const emptyForm: WorkspaceOnboardingFormValues = {
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
  // Which client the flow opens pre-scoped to — set when onboarding is started
  // from the "Needs attention" list so the client select arrives already filled.
  const [pendingClientId, setPendingClientId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const newestClient = clients[0] ?? null;
  const currencyList = Array.from(
    new Set(
      clients.flatMap((client) =>
        client.workspaces.map((workspace) => workspace.defaultCurrency),
      ),
    ),
  );
  const totalWorkspaces = clients.reduce((sum, client) => sum + client.workspaces.length, 0);
  const clientsWithWorkspace = clients.filter((client) => client.workspaces.length > 0).length;
  const incompleteClients = clients.filter((client) => client.workspaces.length === 0);
  const isDemoClient = (name: string): boolean => /\(demo\)/i.test(name);
  const liveClientCount = clients.filter((client) => !isDemoClient(client.name)).length;
  const demoClientCount = clients.length - liveClientCount;

  const startOnboarding = (clientId?: string): void => {
    setPendingClientId(clientId ?? null);
    setFormError(null);
    setShowForm(true);
  };

  const onSubmit = async (values: WorkspaceOnboardingFormValues): Promise<void> => {
    setFormError(null);
    setNotice(null);
    try {
      const result = await onboardClient({
        variables: {
          input: {
            clientId: values.clientId === NEW_CLIENT_OPTION ? null : values.clientId,
            legalName: values.legalName.trim(),
            displayName: values.displayName.trim() || null,
            defaultLocale: values.defaultLocale.trim() || null,
            defaultCurrency: values.defaultCurrency.trim().toUpperCase(),
            adminEmail: values.adminEmail.trim(),
            adminPassword: values.adminPassword,
            hrAdminEmail: values.hrAdminEmail.trim(),
            hrAdminPassword: values.hrAdminPassword,
          },
        },
      });
      const adminEmail = result.data?.onboardClient.initialAdmin.email;
      const hrAdminEmail = result.data?.onboardClient.initialHrAdmin.email;
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

  // The intake takes over the page rather than sitting above the table, so the
  // flow is not competing with the portfolio it is about to add to.
  if (showForm) {
    return (
      <main className="onboarding-page">
        <WorkspaceOnboardingForm
          clients={clients}
          formError={formError}
          initialValues={
            pendingClientId ? { ...emptyForm, clientId: pendingClientId } : emptyForm
          }
          submitting={onboarding}
          onCancel={() => setShowForm(false)}
          onSubmit={(values) => void onSubmit(values)}
        />
      </main>
    );
  }

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
              onClick={() => startOnboarding()}
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
            <div className="metric-value">{loading ? '...' : currencyList.length}</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Newest</div>
            <div className="metric-value">
              {loading ? '...' : newestClient ? formatDate(newestClient.createdAt) : '-'}
            </div>
          </div>
        </div>

        {notice ? <p className="form-success">{notice}</p> : null}

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
                      <td data-label="Workspaces">
                        {client.workspaces.length === 0
                          ? '-'
                          : client.workspaces.map((workspace) => workspace.displayName).join(', ')}
                      </td>
                      <td data-label="Currencies">
                        {Array.from(
                          new Set(client.workspaces.map((workspace) => workspace.defaultCurrency)),
                        ).join(', ') || '-'}
                      </td>
                      <td data-label="Created">{formatDate(client.createdAt)}</td>
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

      <aside className="client-portfolio-panel" aria-label="Portfolio at a glance">
        <section className="self-service-section">
          <div className="panel-title-row">
            <div>
              <div className="panel-kicker">Portfolio</div>
              <h2 className="panel-title">At a glance</h2>
            </div>
            <IconBuildingCommunity size={theme.icon.size.lg} stroke={theme.icon.stroke.lg} />
          </div>
          <div className="field-list">
            <div className="field-row">
              <span className="field-label">Workspace coverage</span>
              <span className="field-value">
                {loading ? '...' : `${clientsWithWorkspace} of ${clients.length} clients`}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Live / demo</span>
              <span className="field-value">
                {loading ? '...' : `${liveClientCount} live · ${demoClientCount} demo`}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Currencies</span>
              <span className="field-value">
                {loading ? '...' : currencyList.join(', ') || '—'}
              </span>
            </div>
            <div className="field-row">
              <span className="field-label">Newest</span>
              <span className="field-value">
                {loading
                  ? '...'
                  : newestClient
                    ? `${newestClient.name} · ${formatDate(newestClient.createdAt)}`
                    : '—'}
              </span>
            </div>
          </div>
        </section>

        <section className="self-service-section">
          <div className="section-title-row">
            <h3 className="section-title">Needs attention</h3>
            {incompleteClients.length > 0 ? (
              <span className="chip chip-amber">{incompleteClients.length}</span>
            ) : null}
          </div>
          {incompleteClients.length === 0 ? (
            <p className="field-hint">
              {loading
                ? 'Checking clients...'
                : 'Every client has at least one workspace.'}
            </p>
          ) : (
            <ul className="portfolio-attention-list">
              {incompleteClients.map((client) => (
                <li key={client.id} className="portfolio-attention-item">
                  <span className="portfolio-attention-name">{client.name}</span>
                  <span className="portfolio-attention-note">No workspace yet</span>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => startOnboarding(client.id)}
                  >
                    Add workspace
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </main>
  );
};
