import type { EmployeeId, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_work_histories')
@Index(['organizationId', 'employeeId'])
export class EmployeeWorkHistory extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'varchar', length: 256 })
  companyName!: string;

  @Column({ type: 'varchar', length: 160, nullable: true })
  designation!: string | null;

  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: true })
  salary!: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  address!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  contact!: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  totalExperience!: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId!: UserId | null;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;
}
