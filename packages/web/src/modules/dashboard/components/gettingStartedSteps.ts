import { gql, useQuery } from '@apollo/client';
import {
  IconBriefcase,
  IconBuildingCommunity,
  IconCurrencyDollar,
  IconMessageCircle,
  IconPlaneDeparture,
  IconReportMoney,
  IconSpeakerphone,
  IconUserCircle,
  IconUserPlus,
  IconUsersGroup,
  type TablerIcon,
} from '@tabler/icons-react';

import { useAuth } from '../../auth/hooks/useAuth';
import { CLIENT_WORKSPACE_QUERY } from '../../client/graphql/client-workspace.operations';

// A single "explore the product" step: a titled, linked action whose completion
// is computed from real workspace data. `locked` steps render disabled.
export type GettingStartedStep = {
  readonly id: string;
  readonly title: string;
  readonly detail: string;
  readonly to: string;
  readonly icon: TablerIcon;
  readonly complete: boolean;
  readonly locked?: boolean;
};

export type GettingStartedSteps = {
  readonly steps: readonly GettingStartedStep[];
  readonly loading: boolean;
  readonly error: boolean;
};

const TETHR_QUERY = gql`
  query DashboardGettingStartedTethr {
    clients {
      id
    }
    hiringRequests {
      id
      status
    }
    payrollRuns {
      id
      status
    }
  }
`;

const EMPLOYEE_QUERY = gql`
  query DashboardGettingStartedEmployee {
    myEmployeeProfile {
      employeeId
      phone
      addressLine1
      city
    }
    myLeaveRequests {
      id
    }
    announcements {
      id
    }
    myPayslips {
      id
    }
  }
`;

type StepsData = {
  readonly clients?: readonly { readonly id: string }[];
  readonly hiringRequests?: readonly { readonly id: string; readonly status: string }[];
  readonly payrollRuns?: readonly { readonly id: string; readonly status: string }[];
  readonly salaryStructures?: readonly { readonly id: string }[];
  readonly employees?: readonly { readonly id: string }[];
  readonly myEmployeeProfile?: {
    readonly phone: string | null;
    readonly addressLine1: string | null;
    readonly city: string | null;
  } | null;
  readonly myLeaveRequests?: readonly { readonly id: string }[];
  readonly announcements?: readonly { readonly id: string }[];
  readonly myPayslips?: readonly { readonly id: string }[];
};

const count = (list: readonly unknown[] | undefined): number => list?.length ?? 0;

const tethrSteps = (data: StepsData | undefined, isAdmin: boolean): readonly GettingStartedStep[] => [
  {
    id: 'add-client',
    title: 'Add your first client',
    detail: count(data?.clients) > 0 ? `${count(data?.clients)} in portfolio` : 'Onboard a company you manage',
    to: '/clients',
    icon: IconBuildingCommunity,
    complete: count(data?.clients) > 0,
  },
  {
    id: 'post-hiring',
    title: 'Post a hiring request',
    detail: count(data?.hiringRequests) > 0 ? `${count(data?.hiringRequests)} tracked` : 'Kick off an intake for a client role',
    to: '/hiring',
    icon: IconBriefcase,
    complete: count(data?.hiringRequests) > 0,
  },
  {
    id: 'run-payroll',
    title: 'Run a payroll cycle',
    detail: (data?.payrollRuns ?? []).some((run) => run.status === 'finalized')
      ? 'A run has been finalized'
      : 'Draft, review and finalize a pay run',
    to: '/payroll',
    icon: IconReportMoney,
    complete: (data?.payrollRuns ?? []).some((run) => run.status === 'finalized'),
  },
  {
    id: 'invite-teammate',
    title: 'Invite a teammate',
    detail: isAdmin ? 'Add Tethr staff to this workspace' : 'Workspace admin only',
    to: '/users',
    icon: IconUserPlus,
    complete: isAdmin,
    locked: !isAdmin,
  },
];

const clientSteps = (data: StepsData | undefined, isAdmin: boolean): readonly GettingStartedStep[] => [
  {
    id: 'review-employees',
    title: 'Review employee records',
    detail: count(data?.employees) > 0 ? `${count(data?.employees)} available` : 'Waiting on setup',
    to: '/employees',
    icon: IconUsersGroup,
    complete: count(data?.employees) > 0,
  },
  {
    id: 'post-hiring',
    title: 'Post a hiring request',
    detail: count(data?.hiringRequests) > 0 ? `${count(data?.hiringRequests)} tracked` : 'Submit new roles for Tethr intake',
    to: '/hiring',
    icon: IconBriefcase,
    complete: count(data?.hiringRequests) > 0,
  },
  {
    id: 'manage-teammates',
    title: 'Manage teammates',
    detail: isAdmin ? 'Invite and manage workspace users' : 'Client admin only',
    to: '/users',
    icon: IconUserPlus,
    complete: isAdmin,
    locked: !isAdmin,
  },
  {
    id: 'review-compensation',
    title: 'Review compensation',
    detail: !isAdmin
      ? 'Client admin only'
      : count(data?.salaryStructures) > 0
        ? `${count(data?.salaryStructures)} salary structures`
        : 'Salary history and adjustments',
    to: '/compensation',
    icon: IconCurrencyDollar,
    complete: isAdmin && count(data?.salaryStructures) > 0,
    locked: !isAdmin,
  },
];

const employeeSteps = (data: StepsData | undefined): readonly GettingStartedStep[] => {
  const profile = data?.myEmployeeProfile;
  const profileComplete = Boolean(profile?.phone && profile?.addressLine1 && profile?.city);
  return [
    {
      id: 'complete-profile',
      title: 'Complete your profile',
      detail: profileComplete ? 'Contact details are on file' : 'Add your phone and address',
      to: '/me',
      icon: IconUserCircle,
      complete: profileComplete,
    },
    {
      id: 'request-time-off',
      title: 'Request time off',
      detail: count(data?.myLeaveRequests) > 0 ? 'You have leave on record' : 'Book your first leave',
      to: '/me',
      icon: IconPlaneDeparture,
      complete: count(data?.myLeaveRequests) > 0,
    },
    {
      id: 'view-payslip',
      title: 'View a payslip',
      detail: count(data?.myPayslips) > 0 ? `${count(data?.myPayslips)} available` : 'Payslips appear here once payroll runs',
      to: '/me',
      icon: IconReportMoney,
      complete: count(data?.myPayslips) > 0,
    },
    {
      id: 'read-announcement',
      title: 'Read the latest news',
      detail: count(data?.announcements) > 0 ? `${count(data?.announcements)} announcements` : 'Company announcements land here',
      to: '/announcements',
      icon: IconSpeakerphone,
      complete: count(data?.announcements) > 0,
    },
    {
      id: 'share-feedback',
      title: 'Share feedback with HR',
      detail: 'Raise a question or concern any time',
      to: '/me',
      icon: IconMessageCircle,
      complete: false,
    },
  ];
};

// The tethr walkthrough touches admin-only data (clients, payroll), so it is
// only offered to tethr admins; other tethr roles get no panel (empty steps).
export const useGettingStartedSteps = (): GettingStartedSteps => {
  const { user } = useAuth();
  const portal = user?.portal ?? 'none';
  const roleKeys = user?.roleKeys ?? [];
  const supported =
    portal === 'employee' ||
    portal === 'client' ||
    (portal === 'tethr' && roleKeys.includes('tethrAdmin'));

  const query = portal === 'employee' ? EMPLOYEE_QUERY : portal === 'client' ? CLIENT_WORKSPACE_QUERY : TETHR_QUERY;

  const { data, loading, error } = useQuery<StepsData>(query, {
    fetchPolicy: 'cache-and-network',
    skip: !supported,
  });

  if (!supported) {
    return { steps: [], loading: false, error: false };
  }

  const steps =
    portal === 'employee'
      ? employeeSteps(data)
      : portal === 'client'
        ? clientSteps(data, roleKeys.includes('clientAdmin'))
        : tethrSteps(data, roleKeys.includes('tethrAdmin'));

  return { steps, loading, error: Boolean(error) };
};
