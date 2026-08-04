// Nominal typing for identifiers. `Brand<string, 'EmployeeId'>` is assignable to
// `string`, but a plain `string` is NOT assignable to it without going through a
// constructor — so a `PositionId` can never be passed where an `EmployeeId` is
// expected. This is the cheapest defense against the ID-mixups that plague a
// system where every module references others by ID (non-negotiable #2).

declare const brand: unique symbol;

export type Brand<TValue, TBrand extends string> = TValue & {
  readonly [brand]: TBrand;
};

// --- Platform / tenancy ---
export type OrganizationId = Brand<string, 'OrganizationId'>;
export type LegalEntityId = Brand<string, 'LegalEntityId'>;
export type LocationId = Brand<string, 'LocationId'>;
export type DepartmentId = Brand<string, 'DepartmentId'>;
export type CostCenterId = Brand<string, 'CostCenterId'>;

// --- Identity / authz ---
export type UserId = Brand<string, 'UserId'>;
export type RoleId = Brand<string, 'RoleId'>;
export type PermissionId = Brand<string, 'PermissionId'>;

// --- Position / job ---
export type JobId = Brand<string, 'JobId'>;
export type JobFamilyId = Brand<string, 'JobFamilyId'>;
export type GradeId = Brand<string, 'GradeId'>;
export type PayBandId = Brand<string, 'PayBandId'>;
export type PositionId = Brand<string, 'PositionId'>;

// --- Core HR ---
export type EmployeeId = Brand<string, 'EmployeeId'>;
export type AssignmentId = Brand<string, 'AssignmentId'>;
export type EmployeeAssessmentId = Brand<string, 'EmployeeAssessmentId'>;
export type EmployeeDocumentLinkId = Brand<string, 'EmployeeDocumentLinkId'>;

// --- Time off & attendance (Phase 2) ---
export type LeaveTypeId = Brand<string, 'LeaveTypeId'>;
export type LeaveBalanceId = Brand<string, 'LeaveBalanceId'>;
export type LeaveRequestId = Brand<string, 'LeaveRequestId'>;
export type HolidayCalendarId = Brand<string, 'HolidayCalendarId'>;
export type HolidayId = Brand<string, 'HolidayId'>;
export type TimesheetId = Brand<string, 'TimesheetId'>;
export type TimeEntryId = Brand<string, 'TimeEntryId'>;
export type ClockEventId = Brand<string, 'ClockEventId'>;
export type RegularizationId = Brand<string, 'RegularizationId'>;

// --- Compensation & payroll (Phase 3) ---
export type SalaryStructureId = Brand<string, 'SalaryStructureId'>;
export type PayComponentId = Brand<string, 'PayComponentId'>;
export type SalaryRevisionId = Brand<string, 'SalaryRevisionId'>;
export type BonusAwardId = Brand<string, 'BonusAwardId'>;

// --- Recruitment ---
export type HiringRequestId = Brand<string, 'HiringRequestId'>;

// --- Engagement ---
export type AnnouncementId = Brand<string, 'AnnouncementId'>;
export type EmployeeFeedbackId = Brand<string, 'EmployeeFeedbackId'>;

// --- Platform infrastructure ---
export type AuditEventId = Brand<string, 'AuditEventId'>;
export type OutboxMessageId = Brand<string, 'OutboxMessageId'>;
export type DocumentId = Brand<string, 'DocumentId'>;

// Cast a raw string (from the DB, GraphQL input, or a URL param) into a branded
// id. This is a deliberate trust-boundary escape hatch — only call it where a
// value enters the system, never to paper over a type error mid-pipeline.
export const toId = <TId extends Brand<string, string>>(value: string): TId => value as TId;

// Structural equality for branded ids (they are strings under the brand).
export const idEquals = <TId extends Brand<string, string>>(a: TId, b: TId): boolean => a === b;
