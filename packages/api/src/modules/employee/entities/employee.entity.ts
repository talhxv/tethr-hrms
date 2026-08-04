import type { EmploymentStatus, IsoDate, WorkerType } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// The HR system of record for a person's employment. Distinct from a User login
// (non-negotiable #6). Other modules reference an employee by `id` and read facts
// through EmployeeDirectoryService — never by querying this table directly
// (non-negotiable #1).
@Entity('employees')
@Index(['organizationId', 'employeeNumber'], { unique: true })
export class Employee extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 32 })
  employeeNumber!: string;

  @Column({ type: 'varchar', length: 128 })
  firstName!: string;

  @Column({ type: 'varchar', length: 128 })
  lastName!: string;

  @Column({ type: 'varchar', length: 320, nullable: true })
  workEmail!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  roleTitle!: string | null;

  @Column({ type: 'date', nullable: true })
  dateOfBirth!: IsoDate | null;

  @Column({ type: 'date', nullable: true })
  probationEndDate!: IsoDate | null;

  @Column({ type: 'date' })
  hireDate!: IsoDate;

  @Column({ type: 'date', nullable: true })
  terminationDate!: IsoDate | null;

  @Column({ type: 'varchar', length: 16, default: 'active' })
  employmentStatus!: EmploymentStatus;

  @Column({ type: 'varchar', length: 16, default: 'permanent' })
  workerType!: WorkerType;
}
