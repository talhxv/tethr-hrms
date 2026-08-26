import { gql, useQuery } from '@apollo/client';
import { IconArrowRight, IconUsersGroup } from '@tabler/icons-react';
import { Link } from 'react-router-dom';

import { useTheme } from '../../../providers/theme/useTheme';

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
          <p className="page-subtitle">Your workspace at a glance.</p>
        </div>
      </header>

      {error ? (
        <p className="auth-error" role="alert">
          Could not load workspace metrics.
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

      <section className="dashboard-next-step" aria-label="Get started">
        <div className="dashboard-next-step-icon">
          <IconUsersGroup size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
        </div>
        <div className="dashboard-next-step-copy">
          <h2 className="panel-title">Add your first employee</h2>
          <p>Open the People menu in the top navigation to build out your employee directory.</p>
        </div>
        <Link className="button button-secondary" to="/employees">
          Go to Employees
          <IconArrowRight size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
        </Link>
      </section>
    </main>
  );
};
