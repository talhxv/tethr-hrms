import {
  IconBell,
  IconBuildingCommunity,
  IconBriefcase,
  IconChevronRight,
  IconCurrencyDollar,
  IconLayoutDashboard,
  IconLogout,
  IconMoon,
  IconPlaneDeparture,
  IconSearch,
  IconMessageCircle,
  IconSpeakerphone,
  IconSun,
  IconUserCircle,
  IconUsersGroup,
  type TablerIcon,
} from '@tabler/icons-react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../modules/auth/hooks/useAuth';
import { useTheme } from '../providers/theme/useTheme';

import { portalLabel } from './portal';

type NavigationItem = {
  readonly label: string;
  readonly to: string;
  readonly icon: TablerIcon;
};

const tethrNavigation: readonly NavigationItem[] = [
  { label: 'Dashboard', to: '/dashboard', icon: IconLayoutDashboard },
  { label: 'Clients', to: '/clients', icon: IconBuildingCommunity },
  { label: 'Employees', to: '/employees', icon: IconUsersGroup },
  { label: 'Hiring requests', to: '/hiring', icon: IconBriefcase },
  { label: 'Leave triage', to: '/leave', icon: IconPlaneDeparture },
  { label: 'Compensation', to: '/compensation', icon: IconCurrencyDollar },
  { label: 'Announcements', to: '/announcements', icon: IconSpeakerphone },
  { label: 'Feedback', to: '/feedback', icon: IconMessageCircle },
];

const clientNavigation: readonly NavigationItem[] = [
  { label: 'Overview', to: '/client', icon: IconLayoutDashboard },
  { label: 'Employees', to: '/employees', icon: IconUsersGroup },
  { label: 'Hiring requests', to: '/hiring', icon: IconBriefcase },
  { label: 'Leave requests', to: '/leave', icon: IconPlaneDeparture },
  { label: 'Compensation', to: '/compensation', icon: IconCurrencyDollar },
  { label: 'Announcements', to: '/announcements', icon: IconSpeakerphone },
];

const employeeNavigation: readonly NavigationItem[] = [
  { label: 'My workspace', to: '/me', icon: IconUserCircle },
  { label: 'News', to: '/announcements', icon: IconSpeakerphone },
];

const workspaceUsersNavigation: NavigationItem = {
  label: 'Users',
  to: '/users',
  icon: IconUsersGroup,
};

const SECTION_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Client portfolio',
  '/client': 'People overview',
  '/me': 'My workspace',
  '/employees': 'Employees',
  '/compensation': 'Compensation',
  '/hiring': 'Hiring requests',
  '/leave': 'Leave triage',
  '/announcements': 'News bulletin',
  '/feedback': 'Employee feedback',
  '/users': 'Workspace users',
};

const renderNavigationItem = (item: NavigationItem, iconSize: number, iconStroke: number) => {
  const Icon = item.icon;
  const content = (
    <>
      <Icon size={iconSize} stroke={iconStroke} />
      <span>{item.label}</span>
    </>
  );

  return (
    <NavLink
      className={({ isActive }) => `sidebar-nav-item${isActive ? ' is-active' : ''}`}
      key={item.label}
      to={item.to}
    >
      {content}
    </NavLink>
  );
};

export const AppShell = () => {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const ThemeIcon = theme.name === 'light' ? IconMoon : IconSun;
  const section = SECTION_LABELS[pathname] ?? 'Workspace';
  const accountInitials = (user?.email ?? '?').slice(0, 2).toUpperCase();
  const portal = user?.portal ?? 'none';
  const navigation =
    portal === 'tethr'
      ? tethrNavigation
      : portal === 'client'
        ? clientNavigation
        : employeeNavigation;
  const canManageUsers =
    user?.roleKeys.includes('tethrAdmin') || user?.roleKeys.includes('clientAdmin');
  const canManageCompensation =
    portal === 'tethr' || user?.roleKeys.includes('clientAdmin') === true;
  const canManageClients = user?.roleKeys.includes('tethrAdmin') === true;
  const visibleNavigation = navigation.filter(
    (item) =>
      (item.to !== '/compensation' || canManageCompensation) &&
      (item.to !== '/clients' || canManageClients),
  );

  const onLogout = async (): Promise<void> => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-shell">
      <aside className="app-sidebar" aria-label="Primary navigation">
        <div className="brand-lockup">
          <div className="brand-mark" aria-hidden="true">
            T
          </div>
          <div>
            <div className="brand-name">Tethr</div>
            <div className="brand-context">{portalLabel(portal)} workspace</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Workspace</div>
          {visibleNavigation.map((item) =>
            renderNavigationItem(item, theme.icon.size.md, theme.icon.stroke.md),
          )}
          {canManageUsers
            ? renderNavigationItem(
                workspaceUsersNavigation,
                theme.icon.size.md,
                theme.icon.stroke.md,
              )
            : null}
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="breadcrumb">
            <span>{portalLabel(portal)}</span>
            <IconChevronRight size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
            <strong>{section}</strong>
          </div>

          <label className="topbar-search">
            <IconSearch size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            <input aria-label="Search" placeholder="Search" type="search" />
          </label>

          <div className="topbar-actions">
            <button className="icon-button" title="Notifications" type="button">
              <IconBell size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            </button>
            <button
              className="icon-button"
              onClick={toggle}
              title={`Switch to ${theme.name === 'light' ? 'dark' : 'light'} theme`}
              type="button"
            >
              <ThemeIcon size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            </button>
            <span className="account-button" title={user?.email ?? undefined}>
              <span className="account-avatar">{accountInitials}</span>
              <span className="truncate">{user?.email ?? 'Account'}</span>
            </span>
            <button className="icon-button" onClick={onLogout} title="Sign out" type="button">
              <IconLogout size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
            </button>
          </div>
        </header>

        <Outlet />
      </div>
    </div>
  );
};
