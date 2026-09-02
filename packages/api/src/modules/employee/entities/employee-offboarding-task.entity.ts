import type { EmployeeId, EmployeeOffboardingTaskStatus, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

export type EmployeeOffboardingTaskKey =
  | 'clearance'
  | 'assetReturn'
  | 'knowledgeTransfer'
  | 'exitInterview'
  | 'finalSettlement'
  | 'deprovision';

@Entity('employee_offboarding_tasks')
@Index(['organizationId', 'employeeId', 'taskKey'], { unique: true })
export class EmployeeOffboardingTask extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'uuid', nullable: true })
  separationId!: string | null;

  @Column({ type: 'varchar', length: 40 })
  taskKey!: EmployeeOffboardingTaskKey;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'varchar', length: 16, default: 'notStarted' })
  status!: EmployeeOffboardingTaskStatus;

  @Column({ type: 'date', nullable: true })
  dueDate!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  completedByUserId!: UserId | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;
}
