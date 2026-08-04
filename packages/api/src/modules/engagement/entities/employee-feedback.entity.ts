import type { EmployeeId, FeedbackCategory, FeedbackStatus, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_feedback')
@Index(['organizationId', 'status'])
@Index(['organizationId', 'employeeId'])
export class EmployeeFeedback extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'uuid' })
  submittedByUserId!: UserId;

  @Column({ type: 'varchar', length: 24, default: 'general' })
  category!: FeedbackCategory;

  @Column({ type: 'varchar', length: 160 })
  subject!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'varchar', length: 16, default: 'submitted' })
  status!: FeedbackStatus;

  @Column({ type: 'uuid', nullable: true })
  resolvedByUserId!: UserId | null;

  @Column({ type: 'text', nullable: true })
  resolutionNote!: string | null;
}
