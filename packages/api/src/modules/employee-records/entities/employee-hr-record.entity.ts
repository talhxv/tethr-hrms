import type { EmployeeId, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_hr_records')
@Index(['organizationId', 'employeeId'], { unique: true })
export class EmployeeHrRecord extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'varchar', length: 160, nullable: true })
  roleTitle!: string | null;

  @Column({ type: 'text', nullable: true })
  salaryBreakdown!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  bankName!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  bankAccountTitle!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  bankAccountNumber!: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  bankIban!: string | null;

  @Column({ type: 'text', nullable: true })
  hardwareInfo!: string | null;

  @Column({ type: 'text', nullable: true })
  employeeRecordForm!: string | null;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;
}
