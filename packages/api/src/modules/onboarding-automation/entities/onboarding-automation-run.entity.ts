import type {
  EmployeeId,
  OnboardingAutomationRunStatus,
  OnboardingAutomationStage,
  UserId,
} from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// One press of "Run automation": what stage it ran from, whether the workflow
// accepted it, and what it reported back. The history doubles as the audit
// trail HR reads on the employee's Onboarding tab.
@Entity('onboarding_automation_runs')
@Index(['organizationId', 'employeeId', 'createdAt'])
export class OnboardingAutomationRun extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  // The stage the person was at when the run started (what the workflow acts on).
  @Column({ type: 'varchar', length: 32 })
  stage!: OnboardingAutomationStage;

  @Column({ type: 'varchar', length: 16, default: 'queued' })
  status!: OnboardingAutomationRunStatus;

  @Column({ type: 'uuid', nullable: true })
  triggeredByUserId!: UserId | null;

  @Column({ type: 'timestamptz', nullable: true })
  deliveredAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  // HTTP status the webhook answered with (null when it never answered).
  @Column({ type: 'int', nullable: true })
  responseStatus!: number | null;

  // The stage the workflow moved the person to, when it reported one.
  @Column({ type: 'varchar', length: 32, nullable: true })
  resultStage!: OnboardingAutomationStage | null;

  // The document the run produced (the drafted or sent letter), if reported.
  @Column({ type: 'text', nullable: true })
  documentUrl!: string | null;

  // Plain-language outcome or error, shown to HR as-is.
  @Column({ type: 'text', nullable: true })
  message!: string | null;
}
