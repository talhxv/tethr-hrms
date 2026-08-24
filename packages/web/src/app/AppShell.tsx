import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { WORKSPACE_BRAND_COLORS, type PortalKind, type WorkspaceBrandColor } from '@hrms/shared';
import {
  IconArrowsRightLeft,
  IconBell,
  IconBriefcase,
  IconBuildingCommunity,
  IconChevronDown,
  IconCurrencyDollar,
  IconFileInvoice,
  IconLayoutDashboard,
  IconLogout,
  IconMessageCircle,
  IconMoon,
  IconPlaneDeparture,
  IconReportMoney,
  IconSearch,
  IconSpeakerphone,
  IconSun,
  IconUserCircle,
  IconUsersGroup,
  type TablerIcon,
} from '@tabler/icons-react';
import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { HAS_OTHER_WORKSPACES_QUERY } from '../modules/auth/graphql/auth.operations';
import { useAuth, type WorkspaceOption } from '../modules/auth/hooks/useAuth';
import {
  MY_ORGANIZATION_QUERY,
  UPDATE_MY_ORGANIZATION_BRAND_COLOR_MUTATION,
} from '../modules/organization/graphql/organization.operations';
import { useTheme } from '../providers/theme/useTheme';

import { portalHome, portalLabel } from './portal';

type NavigationItem = {
  readonly label: string;
  readonly to: string;
  readonly icon: TablerIcon;
};

type NavigationLinkEntry = NavigationItem & { readonly kind: 'link' };

type NavigationGroupEntry = {
  readonly kind: 'group';
  readonly label: string;
  readonly icon: TablerIcon;
  readonly items: readonly NavigationItem[];
};

// A top-level entry is either a standalone pill (link) or a labeled
// dropdown (group) — related pages cluster under one pill (e.g. "People")
// instead of spilling into a flat, generic "More" catch-all.
type NavigationEntry = NavigationLinkEntry | NavigationGroupEntry;

type MyOrganization = {
  readonly id: string;
  readonly legalName: string;
  readonly displayName: string;
  readonly brandColor: string;
};
type MyOrganizationData = { readonly myOrganization: MyOrganization };

const tethrNavigation: readonly NavigationEntry[] = [
  { kind: 'link', label: 'Dashboard', to: '/dashboard', icon: IconLayoutDashboard },
  { kind: 'link', label: 'Clients', to: '/clients', icon: IconBuildingCommunity },
  {
    kind: 'group',
    label: 'People',
    icon: IconUsersGroup,
    items: [
      { label: 'Employees', to: '/employees', icon: IconUsersGroup },
      { label: 'Hiring requests', to: '/hiring', icon: IconBriefcase },
      { label: 'Leave triage', to: '/leave', icon: IconPlaneDeparture },
    ],
  },
  { kind: 'link', label: 'Pay', to: '/compensation', icon: IconCurrencyDollar },
  {
    kind: 'group',
    label: 'Finance',
    icon: IconReportMoney,
    items: [
      { label: 'Payroll', to: '/payroll', icon: IconReportMoney },
      { label: 'Billing', to: '/billing', icon: IconFileInvoice },
    ],
  },
  {
    kind: 'group',
    label: 'Engage',
    icon: IconSpeakerphone,
    items: [
      { label: 'Announcements', to: '/announcements', icon: IconSpeakerphone },
      { label: 'Feedback', to: '/feedback', icon: IconMessageCircle },
    ],
  },
];

const clientNavigation: readonly NavigationEntry[] = [
  { kind: 'link', label: 'Overview', to: '/client', icon: IconLayoutDashboard },
  {
    kind: 'group',
    label: 'People',
    icon: IconUsersGroup,
    items: [
      { label: 'Employees', to: '/employees', icon: IconUsersGroup },
      { label: 'Hiring requests', to: '/hiring', icon: IconBriefcase },
      { label: 'Leave requests', to: '/leave', icon: IconPlaneDeparture },
    ],
  },
  { kind: 'link', label: 'Pay', to: '/compensation', icon: IconCurrencyDollar },
  { kind: 'link', label: 'Announcements', to: '/announcements', icon: IconSpeakerphone },
];

const employeeNavigation: readonly NavigationEntry[] = [
  { kind: 'link', label: 'My workspace', to: '/me', icon: IconUserCircle },
  { kind: 'link', label: 'News', to: '/announcements', icon: IconSpeakerphone },
];

const workspaceUsersItem: NavigationItem = { label: 'Users', to: '/users', icon: IconUsersGroup };

const SECTION_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/clients': 'Client portfolio',
  '/client': 'People overview',
  '/me': 'My workspace',
  '/employees': 'Employees',
  '/compensation': 'Pay',
  '/payroll': 'Payroll',
  '/billing': 'Billing',
  '/hiring': 'Hiring requests',
  '/leave': 'Leave triage',
  '/announcements': 'News bulletin',
  '/feedback': 'Employee feedback',
  '/users': 'Workspace users',
};

export const AppShell = () => {
  const { theme, toggle } = useTheme();
  const { user, logout, login, selectWorkspace, isBusy: authBusy } = useAuth();
  const apolloClient = useApolloClient();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (
        navRef.current?.contains(target) ||
        accountRef.current?.contains(target) ||
        workspaceRef.current?.contains(target)
      ) {
        return;
      }
      setOpenMenu(null);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // navRef wraps every pill, including plain links, so clicking one doesn't
  // count as "outside" and close a sibling dropdown — this effect is what
  // actually closes it, by reacting to the resulting route change instead.
  useEffect(() => {
    setOpenMenu(null);
  }, [pathname]);

  // The workspace switcher's own multi-step state (trigger -> password ->
  // pick a workspace), reset whenever its dropdown isn't the open one so it
  // always restarts fresh rather than reopening mid-flow.
  const [switchStep, setSwitchStep] = useState<'trigger' | 'password' | 'picker'>('trigger');
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchPendingSelection, setSwitchPendingSelection] = useState<{
    readonly selectionToken: string;
    readonly workspaces: readonly WorkspaceOption[];
  } | null>(null);
  const [switchError, setSwitchError] = useState<string | null>(null);

  useEffect(() => {
    if (openMenu !== 'workspace') {
      setSwitchStep('trigger');
      setSwitchPassword('');
      setSwitchPendingSelection(null);
      setSwitchError(null);
    }
  }, [openMenu]);

  const { data: orgData } = useQuery<MyOrganizationData>(MY_ORGANIZATION_QUERY);
  const [updateBrandColor, { loading: savingColor }] = useMutation(
    UPDATE_MY_ORGANIZATION_BRAND_COLOR_MUTATION,
    { refetchQueries: [{ query: MY_ORGANIZATION_QUERY }] },
  );
  const { data: workspacesData } = useQuery<{ readonly hasOtherWorkspaces: boolean }>(
    HAS_OTHER_WORKSPACES_QUERY,
  );
  const hasOtherWorkspaces = workspacesData?.hasOtherWorkspaces ?? false;

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
  const canManagePayroll =
    user?.roleKeys.includes('tethrAdmin') === true ||
    user?.roleKeys.includes('tethrFinance') === true;
  const canManageCompensation =
    portal === 'tethr' || user?.roleKeys.includes('clientAdmin') === true;
  const canManageClients = user?.roleKeys.includes('tethrAdmin') === true;
  const canManageOrganization =
    user?.roleKeys.includes('tethrAdmin') || user?.roleKeys.includes('clientAdmin');
  const visibleNavigation: readonly NavigationEntry[] = navigation
    .filter((entry) => entry.kind !== 'link' || entry.to !== '/clients' || canManageClients)
    .filter((entry) => entry.kind !== 'link' || entry.to !== '/compensation' || canManageCompensation)
    // The Finance group (payroll runs + client invoicing) is finance-role only.
    .filter((entry) => entry.kind !== 'group' || entry.label !== 'Finance' || canManagePayroll)
    .map((entry): NavigationEntry => {
      if (entry.kind === 'link') return entry;
      const items = [
        ...entry.items,
        ...(entry.label === 'People' && canManageUsers ? [workspaceUsersItem] : []),
      ];
      return { ...entry, items };
    })
    .filter((entry) => entry.kind === 'link' || entry.items.length > 0);

  // The group whose own sub-pages the user is currently on, if any — drives
  // the persistent second-row tab strip so switching between a group's
  // pages doesn't require reopening the pill's dropdown each time.
  const activeGroupEntry = visibleNavigation.find(
    (entry): entry is NavigationGroupEntry =>
      entry.kind === 'group' && entry.items.some((item) => item.to === pathname),
  );

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

  // Switches in place instead of bouncing out to /login: still re-verifies a
  // password (each workspace can hold a different one for this same email —
  // auth.service.ts — so there's no safe way to mint a session for another
  // org without checking it), but does it inline in the same dropdown via the
  // existing login/selectWorkspace mutations, reusing exactly the flow the
  // login-time picker already uses.
  const finishWorkspaceSwitch = async (portal: PortalKind): Promise<void> => {
    setOpenMenu(null);
    navigate(portalHome(portal), { replace: true });
    // Runs after navigating away, not before: resetting first would briefly
    // refetch the page we're leaving under the new org's identity.
    await apolloClient.resetStore();
  };

  const onSubmitSwitchPassword = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!user?.email) return;
    setSwitchError(null);
    try {
      const outcome = await login(user.email, switchPassword);
      if (outcome.kind === 'authenticated') {
        await finishWorkspaceSwitch(outcome.session.user.portal);
        return;
      }
      const otherWorkspaces = outcome.workspaces.filter(
        (workspace) => workspace.organizationId !== user.organizationId,
      );
      if (otherWorkspaces.length === 1) {
        const session = await selectWorkspace(
          outcome.selectionToken,
          otherWorkspaces[0].organizationId,
        );
        await finishWorkspaceSwitch(session.user.portal);
        return;
      }
      setSwitchPendingSelection({ selectionToken: outcome.selectionToken, workspaces: otherWorkspaces });
      setSwitchStep('picker');
    } catch (caught) {
      setSwitchError(caught instanceof Error ? caught.message : 'Could not verify that password');
    }
  };

  const onPickSwitchWorkspace = async (organizationId: string): Promise<void> => {
    if (!switchPendingSelection) return;
    setSwitchError(null);
    try {
      const session = await selectWorkspace(switchPendingSelection.selectionToken, organizationId);
      await finishWorkspaceSwitch(session.user.portal);
    } catch (caught) {
      setSwitchError(caught instanceof Error ? caught.message : 'Could not open that workspace');
    }
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

  const renderGroup = (entry: NavigationGroupEntry) => {
    const Icon = entry.icon;
    const isOpen = openMenu === entry.label;
    const isActive = entry.items.some((item) => item.to === pathname);
    return (
      <div className="dropdown-anchor" key={entry.label}>
        <button
          className={`nav-pill nav-pill-group${isActive ? ' is-active' : ''}${isOpen ? ' is-open' : ''}`}
          onClick={() => setOpenMenu((current) => (current === entry.label ? null : entry.label))}
          type="button"
        >
          <Icon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
          <span>{entry.label}</span>
          <IconChevronDown size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </button>
        {isOpen ? (
          <div className="dropdown-panel dropdown-panel-more" role="menu">
            {entry.items.map((item) => {
              const ItemIcon = item.icon;
              return (
                <NavLink
                  key={item.label}
                  className={({ isActive: linkIsActive }) =>
                    `dropdown-nav-item${linkIsActive ? ' is-active' : ''}`
                  }
                  to={item.to}
                  onClick={() => setOpenMenu(null)}
                >
                  <ItemIcon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="app-shell" style={chipColorVar}>
      <header className="app-topnav">
        <div className="topnav-left">
          <div className="topnav-brand" aria-hidden="true">
            H
          </div>
          {hasOtherWorkspaces ? (
            <div className="dropdown-anchor" ref={workspaceRef}>
              <button
                className="workspace-chip workspace-chip-button"
                onClick={() =>
                  setOpenMenu((current) => (current === 'workspace' ? null : 'workspace'))
                }
                title={organization?.legalName}
                type="button"
              >
                <span className="workspace-chip-dot" aria-hidden="true" />
                <span className="workspace-chip-name truncate">
                  {organization?.displayName ?? 'Workspace'}
                </span>
                <IconChevronDown size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
              </button>
              {openMenu === 'workspace' ? (
                <div className="dropdown-panel dropdown-panel-workspace" role="menu">
                  {switchStep === 'trigger' ? (
                    <button
                      className="dropdown-nav-item"
                      onClick={() => setSwitchStep('password')}
                      type="button"
                    >
                      <IconArrowsRightLeft size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                      <span>Switch workspace</span>
                    </button>
                  ) : null}

                  {switchStep === 'password' ? (
                    <form onSubmit={(event) => void onSubmitSwitchPassword(event)}>
                      <p className="account-dropdown-hint">
                        Re-enter your password for {user?.email}.
                      </p>
                      {switchError ? (
                        <p className="auth-error" role="alert">
                          {switchError}
                        </p>
                      ) : null}
                      <div className="field">
                        <label htmlFor="switch-workspace-password">Password</label>
                        <input
                          autoFocus
                          autoComplete="current-password"
                          id="switch-workspace-password"
                          required
                          type="password"
                          value={switchPassword}
                          onChange={(event) => setSwitchPassword(event.target.value)}
                        />
                      </div>
                      <button
                        className="button button-primary button-full"
                        disabled={authBusy}
                        type="submit"
                      >
                        {authBusy ? 'Checking…' : 'Continue'}
                      </button>
                      <button
                        className="link-button"
                        onClick={() => setSwitchStep('trigger')}
                        type="button"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : null}

                  {switchStep === 'picker' ? (
                    <div>
                      <p className="account-dropdown-hint">Choose a workspace to switch to.</p>
                      {switchError ? (
                        <p className="auth-error" role="alert">
                          {switchError}
                        </p>
                      ) : null}
                      <div className="workspace-option-list">
                        {switchPendingSelection?.workspaces.map((workspace) => (
                          <button
                            key={workspace.organizationId}
                            className="button button-secondary button-full"
                            disabled={authBusy}
                            type="button"
                            onClick={() => void onPickSwitchWorkspace(workspace.organizationId)}
                          >
                            {workspace.organizationName}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="workspace-chip" title={organization?.legalName}>
              <span className="workspace-chip-dot" aria-hidden="true" />
              <span className="workspace-chip-name truncate">
                {organization?.displayName ?? 'Workspace'}
              </span>
            </div>
          )}
        </div>

        <nav className="topnav-pills" aria-label="Primary navigation" ref={navRef}>
          {visibleNavigation.map((entry) =>
            entry.kind === 'link' ? renderPill(entry) : renderGroup(entry),
          )}
        </nav>

        <div className="topnav-right">
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
                onClick={() =>
                  setOpenMenu((current) => (current === 'account' ? null : 'account'))
                }
                title={user?.email ?? undefined}
                type="button"
              >
                <span className="account-avatar">{accountInitials}</span>
              </button>
              {openMenu === 'account' ? (
                <div className="dropdown-panel dropdown-panel-account" role="menu">
                  <div className="account-dropdown-header">
                    <span className="account-avatar account-avatar-lg">{accountInitials}</span>
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
                          style={
                            { '--swatch-color': `var(--hrms-color-tag-${color})` } as CSSProperties
                          }
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
        </div>
      </header>

      {activeGroupEntry ? (
        <nav className="app-subnav" aria-label={`${activeGroupEntry.label} sections`}>
          {activeGroupEntry.items.map((item) => {
            const ItemIcon = item.icon;
            return (
              <NavLink
                key={item.label}
                className={({ isActive }) => `subnav-tab${isActive ? ' is-active' : ''}`}
                to={item.to}
              >
                <ItemIcon size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      ) : null}

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

