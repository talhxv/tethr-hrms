import type { EmployeeId, LeaveTypeId, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TemporalEntity } from '../../../core/database/entities/temporal.entity';

@Entity('employee_leave_entitlements')
@Index(['organizationId', 'employeeId', 'leaveTypeId'])
export class EmployeeLeaveEntitlement extends TemporalEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'uuid' })
  leaveTypeId!: LeaveTypeId;

  @Column({ type: 'numeric', precision: 7, scale: 2 })
  annualEntitlement!: string;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;
}
