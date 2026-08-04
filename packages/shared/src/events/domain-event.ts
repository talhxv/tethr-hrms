import type {
  AnnouncementId,
  AssignmentId,
  BonusAwardId,
  DocumentId,
  EmployeeAssessmentId,
  EmployeeDocumentLinkId,
  EmployeeId,
  EmployeeFeedbackId,
  HiringRequestId,
  LeaveRequestId,
  LeaveTypeId,
  OrganizationId,
  PositionId,
  SalaryRevisionId,
  SalaryStructureId,
  TimesheetId,
  UserId,
} from '../ids/branded-id';

// The catalog of domain events. Adding an event = add its name here and its
// payload below; the coverage assertion at the bottom fails to compile if the
// two ever drift apart. This list is the contract publishers and consumers share
// (plan.md §5.2) — the bus/outbox implementation lives in @hrms/api.
export const DOMAIN_EVENT_NAMES = [
  'organization.created',
  'employee.created',
  'employee.updated',
  'employee.terminated',
  'assignment.created',
  'assignment.ended',
  'user.created',
  'user.linkedToEmployee',
  'leave.requested',
  'leave.approved',
  'leave.rejected',
  'leave.cancelled',
  'timesheet.submitted',
  'timesheet.locked',
  'compensation.revised',
  'hiringRequest.submitted',
  'hiringRequest.updated',
  'announcement.published',
  'employeeFeedback.submitted',
  'employeeFeedback.updated',
  'employeeAssessment.recorded',
  'employeeDocument.attached',
  'bonus.awarded',
] as const;

export type DomainEventName = (typeof DOMAIN_EVENT_NAMES)[number];

// Payload shape per event. Payloads reference other modules by branded ID only
// (non-negotiable #2) and snapshot the few primitive facts a consumer needs so
// it does not have to call back synchronously for them.
export type DomainEventPayloads = {
  'organization.created': { readonly organizationId: OrganizationId; readonly legalName: string };
  'employee.created': { readonly employeeId: EmployeeId };
  'employee.updated': {
    readonly employeeId: EmployeeId;
    readonly changedFields: readonly string[];
  };
  'employee.terminated': {
    readonly employeeId: EmployeeId;
    readonly effectiveDate: string;
    readonly reason: string;
  };
  'assignment.created': {
    readonly assignmentId: AssignmentId;
    readonly employeeId: EmployeeId;
    readonly positionId: PositionId;
    readonly effectiveDate: string;
  };
  'assignment.ended': {
    readonly assignmentId: AssignmentId;
    readonly employeeId: EmployeeId;
    readonly effectiveDate: string;
  };
  'user.created': { readonly userId: UserId };
  'user.linkedToEmployee': { readonly userId: UserId; readonly employeeId: EmployeeId };
  'leave.requested': {
    readonly leaveRequestId: LeaveRequestId;
    readonly employeeId: EmployeeId;
    readonly leaveTypeId: LeaveTypeId;
    readonly startDate: string;
    readonly endDate: string;
    readonly dayCount: number;
  };
  'leave.approved': {
    readonly leaveRequestId: LeaveRequestId;
    readonly employeeId: EmployeeId;
    readonly leaveTypeId: LeaveTypeId;
    readonly startDate: string;
    readonly endDate: string;
    readonly dayCount: number;
  };
  'leave.rejected': { readonly leaveRequestId: LeaveRequestId; readonly employeeId: EmployeeId };
  'leave.cancelled': { readonly leaveRequestId: LeaveRequestId; readonly employeeId: EmployeeId };
  'timesheet.submitted': {
    readonly timesheetId: TimesheetId;
    readonly employeeId: EmployeeId;
    readonly periodStart: string;
    readonly periodEnd: string;
  };
  'timesheet.locked': {
    readonly timesheetId: TimesheetId;
    readonly employeeId: EmployeeId;
    readonly periodStart: string;
    readonly periodEnd: string;
    readonly totalHours: number;
  };
  'compensation.revised': {
    readonly salaryRevisionId: SalaryRevisionId;
    readonly employeeId: EmployeeId;
    readonly salaryStructureId: SalaryStructureId;
    readonly effectiveDate: string;
    readonly currency: string;
    readonly annualAmount: number;
  };
  'hiringRequest.submitted': {
    readonly hiringRequestId: HiringRequestId;
    readonly positionTitle: string;
  };
  'hiringRequest.updated': {
    readonly hiringRequestId: HiringRequestId;
    readonly status: string;
  };
  'announcement.published': {
    readonly announcementId: AnnouncementId;
    readonly title: string;
    readonly audience: string;
  };
  'employeeFeedback.submitted': {
    readonly employeeFeedbackId: EmployeeFeedbackId;
    readonly employeeId: EmployeeId;
    readonly category: string;
  };
  'employeeFeedback.updated': {
    readonly employeeFeedbackId: EmployeeFeedbackId;
    readonly status: string;
  };
  'employeeAssessment.recorded': {
    readonly employeeAssessmentId: EmployeeAssessmentId;
    readonly employeeId: EmployeeId;
    readonly title: string;
  };
  'employeeDocument.attached': {
    readonly employeeDocumentLinkId: EmployeeDocumentLinkId;
    readonly employeeId: EmployeeId;
    readonly documentId: DocumentId;
    readonly visibility: string;
  };
  'bonus.awarded': {
    readonly bonusAwardId: BonusAwardId;
    readonly employeeId: EmployeeId;
    readonly amount: number;
    readonly currency: string;
  };
};

// The pairing a publisher constructs: a name and its matching payload. Mismatch
// the two and it will not compile. Distributive over the name so the default
// (all names) is a discriminated union on `name` — narrowing on `event.name`
// then narrows `event.payload` to that event's exact shape.
export type DomainEventInput<TName extends DomainEventName = DomainEventName> =
  TName extends DomainEventName
    ? { readonly name: TName; readonly payload: DomainEventPayloads[TName] }
    : never;

type DomainEventEnvelope = {
  readonly eventId: string;
  readonly tenantId: OrganizationId;
  readonly occurredAt: string;
  readonly version: number;
};

// The full envelope once persisted/published. `eventId` is the idempotency key —
// consumers MUST dedupe on it (plan.md §10, "event reliability"). `tenantId`
// keeps every event tenant-scoped end to end. Also a discriminated union on `name`.
export type DomainEvent<TName extends DomainEventName = DomainEventName> =
  TName extends DomainEventName ? DomainEventInput<TName> & DomainEventEnvelope : never;

// Compile-time guard: every name in DOMAIN_EVENT_NAMES must have a payload entry,
// and vice versa. If they drift, `_AssertNamesCovered` resolves to a type that
// `never` is not assignable to — a build error pointing right here.
type _MissingPayload = Exclude<DomainEventName, keyof DomainEventPayloads>;
type _ExtraPayload = Exclude<keyof DomainEventPayloads, DomainEventName>;
const _assertNamesCovered: _MissingPayload | _ExtraPayload extends never ? true : never = true;
void _assertNamesCovered;
