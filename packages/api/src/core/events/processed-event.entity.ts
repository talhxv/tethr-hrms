import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../database/entities/tenant-scoped.entity';

// The consumer-side idempotency ledger. Before a consumer runs its side effect
// it records (consumerName, eventId) here; the unique index makes a second
// attempt a no-op. This is what makes "at-least-once" delivery safe — a redelivered
// event never runs the side effect twice (plan.md §10).
@Entity('processed_events')
@Index(['consumerName', 'eventId'], { unique: true })
export class ProcessedEvent extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 128 })
  consumerName!: string;

  @Column({ type: 'uuid' })
  eventId!: string;

  @Column({ type: 'timestamptz' })
  processedAt!: Date;
}
