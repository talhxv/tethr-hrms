import type { EmployeeId, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_assessments')
@Index(['organizationId', 'employeeId', 'assessmentDate'])
export class EmployeeAssessment extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'date' })
  assessmentDate!: string;

  @Column({ type: 'int', nullable: true })
  score!: number | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  assessorName!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ type: 'uuid' })
  createdByUserId!: UserId;
}
