import { useMutation } from '@apollo/client';
import { formatDate } from '@hrms/shared';
import { IconAlertTriangle, IconBuildingCommunity, IconPlus, IconRefresh } from '@tabler/icons-react';
import { useMemo, useState } from 'react';

import { useQuery } from '../../../app/apollo-hooks';
import { EmptyState } from '../../../components/empty-state/EmptyState';
import {
  DataTable,
  toViewColumns,
  type ColumnDefinition,
} from '../../../components/table/DataTable';
import { Tooltip } from '../../../components/tooltip/Tooltip';
import { useListView } from '../../../components/view-bar/useListView';
import { ViewBar } from '../../../components/view-bar/ViewBar';
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

// Demo data is seeded with "(demo)" in the name; it stays out of the way unless
// someone asks for it.
const isDemoClient = (name: string): boolean => /\(demo\)/i.test(name);

const workspaceNames = (client: ClientRecord): string =>
  client.workspaces.map((workspace) => workspace.displayName).join(', ') || 'No workspace yet';

const currencies = (client: ClientRecord): string =>
  Array.from(new Set(client.workspaces.map((workspace) => workspace.defaultCurrency))).join(', ') || '—';

// Clients & workspaces: a rarely visited Tethr-admin reference, so it lives in
// the full-screen settings surface instead of the daily app navigation. A plain
// list plus the one action that matters here — onboarding a new client.
export const ClientsSettingsPage = () => {
  const { theme } = useTheme();
  const { data, loading, error, refetch } = useQuery<ClientsData>(CLIENTS_QUERY);
  const [onboardClient, { loading: onboarding }] = useMutation(ONBOARD_CLIENT_MUTATION);
  const clients = useMemo(() => data?.clients ?? [], [data]);
  const [showDemo, setShowDemo] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [pendingClientId, setPendingClientId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const view = useListView({ routeKey: '/settings/clients' });

  const demoCount = clients.filter((client) => isDemoClient(client.name)).length;
  const visibleClients = useMemo(
    () => (showDemo ? clients : clients.filter((client) => !isDemoClient(client.name))),
    [clients, showDemo],
  );

  const startOnboarding = (clientId?: string): void => {
    setPendingClientId(clientId ?? null);
    setFormError(null);
    setShowForm(true);
  };

  const columns: readonly ColumnDefinition<ClientRecord>[] = [
    {
      key: 'client',
      header: 'Client',
      width: '30%',
      hideable: false,
      sortValue: (client) => client.name,
      render: (client) => <div className="employee-primary">{client.name}</div>,
    },
    {
      key: 'workspaces',
      header: 'Workspace',
      width: '34%',
      sortValue: (client) => workspaceNames(client),
      render: (client) =>
        client.workspaces.length > 0 ? (
          workspaceNames(client)
        ) : (
          <button className="link-button" onClick={() => startOnboarding(client.id)} type="button">
            Add workspace
          </button>
        ),
    },
    {
      key: 'currency',
      header: 'Currency',
      width: '16%',
      sortValue: (client) => currencies(client),
      render: (client) => currencies(client),
    },
    {
      key: 'created',
      header: 'Created',
      width: '20%',
      sortValue: (client) => client.createdAt,
      render: (client) => formatDate(client.createdAt),
    },
  ];

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
          ? `Workspace created with admin ${adminEmail} and Tethr HR ${hrAdminEmail}`
          : 'Workspace created',
      );
      await refetch();
    } catch (caught) {
      setFormError(caught instanceof Error ? caught.message : 'Could not create this workspace');
    }
  };

  if (showForm) {
    return (
      <main className="page-frame page-frame-single">
        <section className="onboarding-page">
          <WorkspaceOnboardingForm
            clients={clients}
            formError={formError}
            initialValues={pendingClientId ? { ...emptyForm, clientId: pendingClientId } : emptyForm}
            submitting={onboarding}
            onCancel={() => setShowForm(false)}
            onSubmit={(values) => void onSubmit(values)}
          />
        </section>
      </main>
    );
  }

  return (
    <main className="page-frame page-frame-single">
      <div className="employees-content">
        <header className="page-header">
          <div>
            <h2 className="page-title">Clients &amp; workspaces</h2>
            <p className="page-subtitle">The clients Tethr employs staff for, and the workspace each one uses.</p>
          </div>
          <div className="page-actions">
            <button className="button button-primary" type="button" onClick={() => startOnboarding()}>
              <IconPlus aria-hidden="true" size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
              New client workspace
            </button>
          </div>
        </header>

        {notice ? (
          <p className="form-success" role="status">
            {notice}
          </p>
        ) : null}

        <section className="table-shell" aria-label="Clients">
          <ViewBar
            actions={
              <>
                {demoCount > 0 ? (
                  <button
                    aria-pressed={showDemo}
                    className="view-bar-button"
                    onClick={() => setShowDemo((current) => !current)}
                    type="button"
                  >
                    {showDemo ? 'Hide demo' : `Show demo (${demoCount})`}
                  </button>
                ) : null}
                <Tooltip label="Refresh clients">
                  <button
                    aria-label="Refresh clients"
                    className="icon-button"
                    onClick={() => void refetch()}
                    type="button"
                  >
                    <IconRefresh aria-hidden="true" size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
                  </button>
                </Tooltip>
              </>
            }
            columns={toViewColumns(columns)}
            count={visibleClients.length}
            filters={[]}
            view={view}
            viewLabel={showDemo ? 'All clients' : 'Live clients'}
          />
          <DataTable
            columns={columns}
            emptyState={
              error ? (
                <EmptyState
                  icon={IconAlertTriangle}
                  title="Could not load clients"
                  description="Is the API running, and are you still signed in?"
                />
              ) : (
                <EmptyState
                  icon={IconBuildingCommunity}
                  title="No clients yet"
                  description="Create the first client workspace to start."
                />
              )
            }
            getRowKey={(client) => client.id}
            hiddenColumns={view.hiddenColumns}
            loading={loading && !error}
            onHideColumn={view.hideColumn}
            onSort={view.setSort}
            rows={error ? [] : visibleClients}
            skeletonRows={3}
            sorts={view.sorts}
          />
        </section>
      </div>
    </main>
  );
};
