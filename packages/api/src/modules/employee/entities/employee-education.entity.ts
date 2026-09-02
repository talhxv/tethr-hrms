import type { EducationLevel, EmployeeId, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_educations')
@Index(['organizationId', 'employeeId'])
export class EmployeeEducation extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'varchar', length: 256 })
  schoolOrUniversity!: string;

  @Column({ type: 'varchar', length: 256 })
  qualification!: string;

  @Column({ type: 'varchar', length: 16 })
  level!: EducationLevel;

  @Column({ type: 'int', nullable: true })
  yearOfPassing!: number | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  classOrPercentage!: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  majorSubjects!: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId!: UserId | null;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;
}
