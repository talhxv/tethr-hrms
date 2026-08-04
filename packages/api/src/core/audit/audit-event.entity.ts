import type { UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../database/entities/tenant-scoped.entity';


// Append-only record of who did what, when (plan.md §6, "auditability"). Rows are
// never updated or deleted. `before`/`after` capture the change; both reference
// the actor and resource by ID only.
@Entity('audit_events')
@Index(['resourceType', 'resourceId'])
@Index(['organizationId', 'occurredAt'])
export class AuditEvent extends TenantScopedEntity {
  @Column({ type: 'uuid', nullable: true })
  actorUserId!: UserId | null;

  @Column({ type: 'varchar', length: 64 })
  action!: string;

  @Column({ type: 'varchar', length: 64 })
  resourceType!: string;

  @Column({ type: 'varchar', length: 64 })
  resourceId!: string;

  @Column({ type: 'timestamptz' })
  occurredAt!: Date;

  @Column({ type: 'jsonb', nullable: true })
  before!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  after!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;
}
