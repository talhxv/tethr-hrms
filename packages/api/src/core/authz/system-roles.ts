import type { DataScope, PortalKind, SystemRoleKey } from '@hrms/shared';

import { ALL_PERMISSIONS, PERMISSIONS, type Permission } from './permissions';

export type SystemRoleDefinition = {
  readonly key: SystemRoleKey;
  readonly name: string;
  readonly portal: PortalKind;
  readonly dataScope: DataScope;
  readonly permissions: readonly Permission[];
};

// These definitions only seed tenant data. Every authorization decision uses the
// permissions persisted on the effective role, so an administrator can later
// adapt a role without shipping code.
export const SYSTEM_ROLES: Readonly<Record<SystemRoleKey, SystemRoleDefinition>> = {
  tethrAdmin: {
    key: 'tethrAdmin',
    name: 'Tethr administrator',
    portal: 'tethr',
    dataScope: 'organization',
    permissions: ALL_PERMISSIONS,
  },
  tethrHr: {
    key: 'tethrHr',
    name: 'Tethr HR',
    portal: 'tethr',
    dataScope: 'organization',
    permissions: [
      PERMISSIONS.employeeRead,
      PERMISSIONS.employeeWrite,
      PERMISSIONS.employeeSensitiveRead,
      PERMISSIONS.assignmentWrite,
      PERMISSIONS.documentRead,
      PERMISSIONS.documentManage,
      PERMISSIONS.compensationRead,
      PERMISSIONS.compensationWrite,
      PERMISSIONS.bonusManage,
      PERMISSIONS.leaveTeamRead,
      PERMISSIONS.leaveApprove,
      PERMISSIONS.holidayRead,
      PERMISSIONS.hiringRequestRead,
      PERMISSIONS.hiringRequestWrite,
      PERMISSIONS.hiringRequestManage,
      PERMISSIONS.assessmentRead,
      PERMISSIONS.assessmentWrite,
      PERMISSIONS.announcementRead,
      PERMISSIONS.announcementWrite,
      PERMISSIONS.feedbackRead,
      PERMISSIONS.feedbackManage,
    ],
  },
  clientAdmin: {
    key: 'clientAdmin',
    name: 'Client administrator',
    portal: 'client',
    dataScope: 'organization',
    permissions: [
      PERMISSIONS.employeeRead,
      PERMISSIONS.userManage,
      PERMISSIONS.hiringRequestRead,
      PERMISSIONS.hiringRequestWrite,
      PERMISSIONS.assessmentRead,
      PERMISSIONS.assessmentWrite,
      PERMISSIONS.documentRead,
      PERMISSIONS.compensationRead,
      PERMISSIONS.compensationWrite,
      PERMISSIONS.bonusManage,
      PERMISSIONS.leaveTeamRead,
      PERMISSIONS.holidayRead,
      PERMISSIONS.announcementRead,
    ],
  },
  clientMember: {
    key: 'clientMember',
    name: 'Client member',
    portal: 'client',
    dataScope: 'organization',
    permissions: [
      PERMISSIONS.employeeRead,
      PERMISSIONS.hiringRequestRead,
      PERMISSIONS.hiringRequestWrite,
      PERMISSIONS.assessmentRead,
      PERMISSIONS.documentRead,
      PERMISSIONS.compensationRead,
      PERMISSIONS.leaveTeamRead,
      PERMISSIONS.holidayRead,
      PERMISSIONS.announcementRead,
    ],
  },
  employee: {
    key: 'employee',
    name: 'Employee',
    portal: 'employee',
    dataScope: 'own',
    permissions: [
      PERMISSIONS.employeeSelfRead,
      PERMISSIONS.employeeSelfWrite,
      PERMISSIONS.compensationOwnRead,
      PERMISSIONS.leaveOwnRead,
      PERMISSIONS.leaveOwnWrite,
      PERMISSIONS.holidayRead,
      PERMISSIONS.announcementRead,
      PERMISSIONS.feedbackWrite,
    ],
  },
};

export const portalForRoleKeys = (roleKeys: readonly string[]): PortalKind => {
  if (roleKeys.includes('tethrAdmin') || roleKeys.includes('tethrHr')) return 'tethr';
  if (roleKeys.includes('clientAdmin') || roleKeys.includes('clientMember')) return 'client';
  if (roleKeys.includes('employee')) return 'employee';
  return 'none';
};
