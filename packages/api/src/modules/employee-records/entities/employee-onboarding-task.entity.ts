import type {
  EmployeeId,
  EmployeeOnboardingTaskKey,
  EmployeeOnboardingTaskStatus,
  UserId,
} from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_onboarding_tasks')
@Index(['organizationId', 'employeeId', 'taskKey'], { unique: true })
export class EmployeeOnboardingTask extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'varchar', length: 40 })
  taskKey!: EmployeeOnboardingTaskKey;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'varchar', length: 16, default: 'notStarted' })
  status!: EmployeeOnboardingTaskStatus;

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
