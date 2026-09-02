import type {
  BloodGroup,
  EmployeeId,
  MaritalStatus,
  UserId,
} from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_personal_details')
@Index(['organizationId', 'employeeId'], { unique: true })
export class EmployeePersonalDetails extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'varchar', length: 64, nullable: true })
  passportNumber!: string | null;

  @Column({ type: 'date', nullable: true })
  passportIssueDate!: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  passportIssuePlace!: string | null;

  @Column({ type: 'date', nullable: true })
  passportValidUpto!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  maritalStatus!: MaritalStatus | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  bloodGroup!: BloodGroup | null;

  @Column({ type: 'text', nullable: true })
  familyBackground!: string | null;

  @Column({ type: 'text', nullable: true })
  healthDetails!: string | null;

  @Column({ type: 'text', nullable: true })
  bio!: string | null;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;
}
