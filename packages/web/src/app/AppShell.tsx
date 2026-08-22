import { useMutation, useQuery } from '@apollo/client';
import { WORKSPACE_BRAND_COLORS, type WorkspaceBrandColor } from '@hrms/shared';
import {
  IconBell,
  IconBriefcase,
  IconBuildingCommunity,
  IconChevronDown,
  IconCurrencyDollar,
  IconDots,
  IconLayoutDashboard,
  IconLogout,
  IconMessageCircle,
  IconMoon,
  IconPlaneDeparture,
  IconSearch,
  IconSpeakerphone,
  IconSun,
  IconUserCircle,
  IconUsersGroup,
  type TablerIcon,
} from '@tabler/icons-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../modules/auth/hooks/useAuth';
import {
  MY_ORGANIZATION_QUERY,
  UPDATE_MY_ORGANIZATION_BRAND_COLOR_MUTATION,
} from '../modules/organization/graphql/organization.operations';
import { useTheme } from '../providers/theme/useTheme';

import { portalLabel } from './portal';

type NavigationItem = {
  readonly label: string;
  readonly to: string;
  readonly icon: TablerIcon;
};

type MyOrganization = {
  readonly id: string;
  readonly legalName: string;
  readonly displayName: string;
  readonly brandColor: string;
};
type MyOrganizationData = { readonly myOrganization: MyOrganization };

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

// Primary items render as pills; the rest live under "More" — mirrors the
// reference's pill-tabs-plus-overflow pattern rather than a fixed count per
// portal, so it degrades gracefully for the 2-item employee nav (no "More").
const PRIMARY_PILL_COUNT = 4;

export const AppShell = () => {
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [openMenu, setOpenMenu] = useState<'more' | 'account' | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (moreRef.current?.contains(target) || accountRef.current?.contains(target)) return;
      setOpenMenu(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const { data: orgData } = useQuery<MyOrganizationData>(MY_ORGANIZATION_QUERY);
  const [updateBrandColor, { loading: savingColor }] = useMutation(
    UPDATE_MY_ORGANIZATION_BRAND_COLOR_MUTATION,
    { refetchQueries: [{ query: MY_ORGANIZATION_QUERY }] },
  );

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
  const canManageOrganization =
    user?.roleKeys.includes('tethrAdmin') || user?.roleKeys.includes('clientAdmin');
  const visibleNavigation = navigation.filter(
    (item) =>
      (item.to !== '/compensation' || canManageCompensation) &&
      (item.to !== '/clients' || canManageClients),
  );
  const primaryNavigation = visibleNavigation.slice(0, PRIMARY_PILL_COUNT);
  const overflowNavigation = [
    ...visibleNavigation.slice(PRIMARY_PILL_COUNT),
    ...(canManageUsers ? [workspaceUsersNavigation] : []),
  ];
  const moreIsActive = overflowNavigation.some((item) => item.to === pathname);

  const organization = orgData?.myOrganization;
  const brandColor = (organization?.brandColor ?? 'gray') as WorkspaceBrandColor;
  const chipColorVar = { '--chip-color': `var(--hrms-color-tag-${brandColor})` } as CSSProperties;

  const onSelectColor = async (color: WorkspaceBrandColor): Promise<void> => {
    if (!canManageOrganization || savingColor || color === brandColor) return;
    await updateBrandColor({ variables: { input: { brandColor: color } } });
  };

  const onLogout = async (): Promise<void> => {
    await logout();
    navigate('/login', { replace: true });
  };

  const renderPill = (item: NavigationItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.label}
        className={({ isActive }) => `nav-pill${isActive ? ' is-active' : ''}`}
        to={item.to}
      >
        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <div className="app-shell">
      <header className="app-topnav">
        <div className="topnav-left">
          <div className="topnav-brand" aria-hidden="true">
            H
          </div>
          <div className="workspace-chip" title={organization?.legalName}>
            <span className="workspace-chip-dot" style={chipColorVar} aria-hidden="true" />
            <span className="workspace-chip-name truncate">
              {organization?.displayName ?? 'Workspace'}
            </span>
          </div>
        </div>

        <nav className="topnav-pills" aria-label="Primary navigation">
          {primaryNavigation.map(renderPill)}
          {overflowNavigation.length > 0 ? (
            <div className="dropdown-anchor" ref={moreRef}>
              <button
                className={`nav-pill nav-pill-more${moreIsActive ? ' is-active' : ''}`}
                onClick={() => setOpenMenu((current) => (current === 'more' ? null : 'more'))}
                type="button"
              >
                <IconDots size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                <span>More</span>
                <IconChevronDown size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
              </button>
              {openMenu === 'more' ? (
                <div className="dropdown-panel dropdown-panel-more" role="menu">
                  {overflowNavigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.label}
                        className={({ isActive }) =>
                          `dropdown-nav-item${isActive ? ' is-active' : ''}`
                        }
                        to={item.to}
                        onClick={() => setOpenMenu(null)}
                      >
                        <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

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

          <div className="dropdown-anchor" ref={accountRef}>
            <button
              className="account-button"
              onClick={() => setOpenMenu((current) => (current === 'account' ? null : 'account'))}
              title={user?.email ?? undefined}
              type="button"
            >
              <span className="account-avatar" style={chipColorVar}>
                {accountInitials}
              </span>
            </button>
            {openMenu === 'account' ? (
              <div className="dropdown-panel dropdown-panel-account" role="menu">
                <div className="account-dropdown-header">
                  <span className="account-avatar account-avatar-lg" style={chipColorVar}>
                    {accountInitials}
                  </span>
                  <div className="account-dropdown-identity">
                    <div className="account-dropdown-email truncate">
                      {user?.email ?? 'Account'}
                    </div>
                    <div className="account-dropdown-portal">
                      {portalLabel(portal)} workspace
                    </div>
                  </div>
                </div>

                <div className="account-dropdown-section">
                  <div className="account-dropdown-label">Workspace color</div>
                  <div className="color-swatch-grid">
                    {WORKSPACE_BRAND_COLORS.map((color) => (
                      <button
                        key={color}
                        aria-label={color}
                        aria-pressed={brandColor === color}
                        className={`color-swatch${brandColor === color ? ' is-selected' : ''}`}
                        disabled={!canManageOrganization || savingColor}
                        style={{ '--swatch-color': `var(--hrms-color-tag-${color})` } as CSSProperties}
                        title={color}
                        type="button"
                        onClick={() => void onSelectColor(color)}
                      />
                    ))}
                  </div>
                  {!canManageOrganization ? (
                    <p className="account-dropdown-hint">Only workspace admins can change this.</p>
                  ) : null}
                </div>

                <button
                  className="account-dropdown-signout"
                  onClick={() => void onLogout()}
                  type="button"
                >
                  <IconLogout size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                  Sign out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="app-content">
        <div className="app-content-breadcrumb">
          <span>{portalLabel(portal)}</span>
          <span aria-hidden="true">/</span>
          <strong>{section}</strong>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
