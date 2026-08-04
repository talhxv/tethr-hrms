import type { EmployeeId, LeaveTypeId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// An employee's balance for a leave type in a given year. Available = entitled −
// used − pending. References employee and leave type by ID. Amounts are
// numeric-as-string for exactness.
@Entity('leave_balances')
@Index(['organizationId', 'employeeId', 'leaveTypeId', 'periodYear'], { unique: true })
export class LeaveBalance extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'uuid' })
  leaveTypeId!: LeaveTypeId;

  @Column({ type: 'int' })
  periodYear!: number;

  @Column({ type: 'numeric', precision: 7, scale: 2, default: 0 })
  entitledDays!: string;

  @Column({ type: 'numeric', precision: 7, scale: 2, default: 0 })
  usedDays!: string;

  // Reserved by approved-pending requests, so two requests can't both spend the
  // same remaining balance.
  @Column({ type: 'numeric', precision: 7, scale: 2, default: 0 })
  pendingDays!: string;
}
