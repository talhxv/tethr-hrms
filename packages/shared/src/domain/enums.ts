// Domain vocabularies as string-literal unions (never TS enums — see
// architecture.md §6.3). Both backend and frontend import these so a status
// value means the same thing on every side of the wire.

// Authorization data scope: how wide a permission reaches. Payroll-admin for one
// legal entity is not payroll-admin for another (plan.md §6).
export type DataScope = 'own' | 'team' | 'department' | 'legalEntity' | 'organization';

// PII sensitivity tier — drives field-level encryption and erasure handling.
export type DataClassification = 'public' | 'internal' | 'confidential' | 'restricted';

// Lifecycle state of an employment, distinct from whether a login is active.
export type EmploymentStatus = 'active' | 'onLeave' | 'suspended' | 'terminated';

// Worker engagement type — drives statutory and pay treatment downstream.
export type WorkerType = 'permanent' | 'fixedTerm' | 'contractor' | 'intern' | 'temporary';

// Why an employee holds a given assignment. 'primary' is the assignment payroll
// and org-chart default to; the others model acting/dual/secondment cases.
export type AssignmentType = 'primary' | 'secondary' | 'acting' | 'secondment';

// Generic approval outcome used by the workflow engine and anything that routes
// through it (leave, expenses, ...).
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

// Compensation config and salary-revision vocabulary. Payroll consumes these
// values, so they live in shared rather than in the backend module only.
export type PayFrequency = 'monthly' | 'semiMonthly' | 'biweekly' | 'weekly';
export type PayComponentCategory = 'earning' | 'deduction' | 'employerContribution';
export type CompensationChangeReason =
  'hire' | 'merit' | 'promotion' | 'marketAdjustment' | 'correction';

// The system roles that establish the first V1 experiences. Roles remain
// tenant-configurable data, but these stable keys let the product safely select
// a portal and seed a sensible initial permission set.
export type SystemRoleKey = 'tethrAdmin' | 'tethrHr' | 'clientAdmin' | 'clientMember' | 'employee';

// A person can hold more than one role. The portal is a presentation choice made
// from their effective roles; authorization continues to use permissions.
export type PortalKind = 'tethr' | 'client' | 'employee' | 'none';

export type OrganizationKind = 'tethr' | 'client';

export type HiringRequestStatus =
  'submitted' | 'inReview' | 'sourcing' | 'interviewing' | 'offer' | 'filled' | 'cancelled';

export type AnnouncementAudience = 'all' | 'tethr' | 'client' | 'employee';

export type FeedbackCategory = 'general' | 'people' | 'pay' | 'leave' | 'workplace';

export type FeedbackStatus = 'submitted' | 'inReview' | 'resolved';

export type EmployeeOnboardingTaskKey =
  'profile' | 'contract' | 'nda' | 'resume' | 'bankDetails' | 'hardware' | 'employeeRecordForm';

export type EmployeeOnboardingTaskStatus = 'notStarted' | 'inProgress' | 'completed' | 'blocked';

export type EmployeeDocumentCategory = 'contract' | 'nda' | 'resume' | 'id' | 'hardware' | 'other';

export type EmployeeDocumentVisibility = 'all' | 'client' | 'employee' | 'tethr';

export type DocumentSignatureStatus = 'notRequired' | 'pending' | 'signed' | 'declined' | 'expired';

export type BonusReason =
  'performance' | 'retention' | 'referral' | 'spot' | 'clientApproved' | 'other';
