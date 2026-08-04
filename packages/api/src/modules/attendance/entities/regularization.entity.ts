import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

import type { ApprovalStatus, EmployeeId, IsoDate } from '@hrms/shared';

// A request to correct attendance for a day (missed punch, etc.). The table and
// shape are in place; the approval flow layers on later via the workflow engine.
@Entity('regularizations')
@Index(['organizationId', 'employeeId', 'date'])
export class Regularization extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'date' })
  date!: IsoDate;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  requestedHours!: string;

  @Column({ type: 'varchar', length: 300 })
  reason!: string;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status!: ApprovalStatus;
}
