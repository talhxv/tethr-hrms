import { gql, useQuery } from '@apollo/client';

import { useTheme } from '../../../providers/theme/useTheme';
import { useAuth } from '../../auth/hooks/useAuth';

// Live landing metrics. Real counts from the authenticated API — a fresh
// workspace shows zeros, which is exactly right.
const DASHBOARD_QUERY = gql`
  query Dashboard {
    employees {
      id
      employmentStatus
    }
    leaveTypes {
      id
    }
  }
`;

type DashboardData = {
  employees: ReadonlyArray<{ id: string; employmentStatus: string }>;
  leaveTypes: ReadonlyArray<{ id: string }>;
};

export const DashboardPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { data, loading, error } = useQuery<DashboardData>(DASHBOARD_QUERY);

  const employees = data?.employees ?? [];
  const metrics = [
    { label: 'Employees', value: employees.length },
    { label: 'Active', value: employees.filter((e) => e.employmentStatus === 'active').length },
    { label: 'On leave', value: employees.filter((e) => e.employmentStatus === 'onLeave').length },
    { label: 'Leave types', value: data?.leaveTypes.length ?? 0 },
  ];

  return (
    <main className="employees-content" style={{ display: 'block' }}>
      <header className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Signed in as {user?.email ?? 'your account'} — live from the API.
          </p>
        </div>
      </header>

      {error ? (
        <p className="auth-error" role="alert">
          Could not load metrics — is the API running?
        </p>
      ) : null}

      <div className="metric-strip" aria-label="Workspace metrics">
        {metrics.map((metric) => (
          <div className="metric-card" key={metric.label}>
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{loading ? '…' : metric.value}</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop: theme.spacing(5), color: 'var(--hrms-color-text-secondary)' }}>
        Welcome to your workspace. Use the sidebar to manage employees; time-off and
        attendance modules are live on the API and will surface here next.
      </p>
    </main>
  );
};
