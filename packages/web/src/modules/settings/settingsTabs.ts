import type { PortalKind, SystemRoleKey } from '@hrms/shared';
import {
  IconBolt,
  IconBuildingCommunity,
  IconCurrencyDollar,
  IconFileInvoice,
  IconReportMoney,
  IconSettings,
  IconUsers,
  type TablerIcon,
} from '@tabler/icons-react';

export type SettingsTabKey =
  | 'general'
  | 'members'
  | 'billing'
  | 'payroll'
  | 'pay'
  | 'clients'
  | 'automations';

type SettingsPortal = Exclude<PortalKind, 'none' | 'employee'>;

export type SettingsTab = {
  readonly key: SettingsTabKey;
  readonly label: string;
  readonly icon: TablerIcon;
  readonly portals: readonly SettingsPortal[];
  readonly roleKeys: readonly SystemRoleKey[];
};

// Which roles reach each tab mirrors the API permission the page's queries and
// mutations require — keep in lockstep with the resolvers:
//   general  organization:manage  (tethrAdmin, clientAdmin)
//   members  user:manage          (tethrAdmin, tethrHr, clientAdmin) — tethrHr
//            may only create/reset Employee logins (authz.service.ts)
//   billing  billing:write        (tethrAdmin, tethrFinance)
//   payroll  payroll:write        (tethrAdmin, tethrFinance)
//   pay      compensation:write   (tethrAdmin, tethrHr, clientAdmin)
//   clients  client:manage        (tethrAdmin) — rarely used, so it lives here
//            rather than in the daily navigation
//   automations organization:manage (tethrAdmin) — the n8n onboarding workflow
export const SETTINGS_TABS: readonly SettingsTab[] = [
  {
    key: 'general',
    label: 'General',
    icon: IconSettings,
    portals: ['tethr', 'client'],
    roleKeys: ['tethrAdmin', 'clientAdmin'],
  },
  {
    key: 'members',
    label: 'Members',
    icon: IconUsers,
    portals: ['tethr', 'client'],
    roleKeys: ['tethrAdmin', 'tethrHr', 'clientAdmin'],
  },
  {
    key: 'billing',
    label: 'Billing',
    icon: IconFileInvoice,
    portals: ['tethr'],
    roleKeys: ['tethrAdmin', 'tethrFinance'],
  },
  {
    key: 'payroll',
    label: 'Payroll',
    icon: IconReportMoney,
    portals: ['tethr'],
    roleKeys: ['tethrAdmin', 'tethrFinance'],
  },
  {
    key: 'pay',
    label: 'Pay',
    icon: IconCurrencyDollar,
    portals: ['tethr', 'client'],
    roleKeys: ['tethrAdmin', 'tethrHr', 'clientAdmin'],
  },
  {
    key: 'clients',
    label: 'Clients & workspaces',
    icon: IconBuildingCommunity,
    portals: ['tethr'],
    roleKeys: ['tethrAdmin'],
  },
  {
    key: 'automations',
    label: 'Automations',
    icon: IconBolt,
    portals: ['tethr'],
    roleKeys: ['tethrAdmin'],
  },
];

// Wide enough to let the router's settings branch through; each tab narrows
// further with its own guard.
export const SETTINGS_ROLE_KEYS: readonly SystemRoleKey[] = [
  ...new Set(SETTINGS_TABS.flatMap((tab) => [...tab.roleKeys])),
];

type SettingsViewer = {
  readonly portal: PortalKind;
  readonly roleKeys: readonly string[];
};

export const visibleSettingsTabs = (viewer: SettingsViewer | null): readonly SettingsTab[] => {
  if (viewer === null) return [];
  const { portal } = viewer;
  if (portal !== 'tethr' && portal !== 'client') return [];
  return SETTINGS_TABS.filter(
    (tab) =>
      tab.portals.includes(portal) &&
      tab.roleKeys.some((roleKey) => viewer.roleKeys.includes(roleKey)),
  );
};
