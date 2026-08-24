// Permission strings follow '<resource>:<action>'. Roles are granted sets of
// these, and roles live in tenant-scoped data (config-as-data, non-negotiable
// #5) — never hard-coded role checks in business logic.
export const PERMISSIONS = {
  employeeRead: 'employee:read',
  employeeWrite: 'employee:write',
  employeeSensitiveRead: 'employee:sensitive:read',
  employeeSelfRead: 'employee:self:read',
  employeeSelfWrite: 'employee:self:write',
  assignmentWrite: 'assignment:write',
  organizationManage: 'organization:manage',
  positionManage: 'position:manage',
  userManage: 'user:manage',
  roleManage: 'role:manage',
  clientManage: 'client:manage',
  hiringRequestRead: 'hiring-request:read',
  hiringRequestWrite: 'hiring-request:write',
  hiringRequestManage: 'hiring-request:manage',
  assessmentRead: 'assessment:read',
  assessmentWrite: 'assessment:write',
  documentRead: 'document:read',
  documentManage: 'document:manage',
  compensationRead: 'compensation:read',
  compensationOwnRead: 'compensation:own:read',
  compensationWrite: 'compensation:write',
  bonusManage: 'bonus:manage',
  leaveOwnRead: 'leave:own:read',
  leaveTeamRead: 'leave:team:read',
  leaveOwnWrite: 'leave:own:write',
  leaveApprove: 'leave:approve',
  holidayRead: 'holiday:read',
  announcementRead: 'announcement:read',
  announcementWrite: 'announcement:write',
  feedbackRead: 'feedback:read',
  feedbackWrite: 'feedback:write',
  feedbackManage: 'feedback:manage',
  payrollRead: 'payroll:read',
  payrollWrite: 'payroll:write',
  payrollFinalize: 'payroll:finalize',
  payslipRead: 'payslip:read',
  payslipOwnRead: 'payslip:own:read',
  billingRead: 'billing:read',
  billingWrite: 'billing:write',
  billingOwnRead: 'billing:own:read',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS = Object.values(PERMISSIONS) as Permission[];
