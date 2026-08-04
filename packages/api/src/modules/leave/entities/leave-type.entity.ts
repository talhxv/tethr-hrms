import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

export type LeaveUnit = 'day' | 'hour';

// A configurable leave category (annual, sick, unpaid, …). This is config-as-data
// (non-negotiable #5): tenants define their own types and entitlements; the leave
// engine is generic over them.
@Entity('leave_types')
@Index(['organizationId', 'code'], { unique: true })
export class LeaveType extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'varchar', length: 32 })
  code!: string;

  @Column({ type: 'varchar', length: 8, default: 'day' })
  unit!: LeaveUnit;

  @Column({ type: 'boolean', default: true })
  paid!: boolean;

  @Column({ type: 'boolean', default: true })
  requiresApproval!: boolean;

  // Default annual entitlement, in `unit`. numeric-as-string to avoid float drift.
  @Column({ type: 'numeric', precision: 7, scale: 2, default: 0 })
  defaultAnnualEntitlement!: string;
}
