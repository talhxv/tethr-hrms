import type { HiringRequestStatus, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// A client-owned staffing request. It references no candidate, employee, or
// position record until the recruitment workflow decides to create one.
@Entity('hiring_requests')
@Index(['organizationId', 'status'])
export class HiringRequest extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 200 })
  positionTitle!: string;

  @Column({ type: 'int', default: 1 })
  headcount!: number;

  @Column({ type: 'varchar', length: 16, default: 'permanent' })
  employmentType!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location!: string | null;

  @Column({ type: 'date', nullable: true })
  preferredStartDate!: string | null;

  @Column({ type: 'text', nullable: true })
  clientNote!: string | null;

  @Column({ type: 'text', nullable: true })
  tethrNote!: string | null;

  @Column({ type: 'varchar', length: 24, default: 'submitted' })
  status!: HiringRequestStatus;

  @Column({ type: 'uuid' })
  requestedByUserId!: UserId;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;
}
