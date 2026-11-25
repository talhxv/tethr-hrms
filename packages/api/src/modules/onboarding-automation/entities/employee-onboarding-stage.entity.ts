import type { EmployeeId, OnboardingAutomationStage, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// Where one person is in the document pipeline (offer letter → employee record
// → contract → salary letter). One row per employee, created the first time HR
// sets a stage or runs the automation; no row reads as 'preOnboard'. The
// employee is referenced by id only (non-negotiable #2).
@Entity('employee_onboarding_stages')
@Index(['organizationId', 'employeeId'], { unique: true })
export class EmployeeOnboardingStage extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'varchar', length: 32, default: 'preOnboard' })
  stage!: OnboardingAutomationStage;

  // The folder the workflow files this person's letters into (Google Drive
  // today). Reported back by the workflow or set by HR.
  @Column({ type: 'text', nullable: true })
  documentsFolderUrl!: string | null;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;
}
