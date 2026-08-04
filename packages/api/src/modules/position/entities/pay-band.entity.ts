import type { GradeId } from '@hrms/shared';
import { Column, Entity } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';


// Monetary amounts use `numeric`, surfaced as strings, to avoid floating-point
// drift in anything money-related.
@Entity('pay_bands')
export class PayBand extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  gradeId!: GradeId;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  minAmount!: string;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  maxAmount!: string;
}
