import type { DomainEventInput } from '@hrms/shared';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager } from 'typeorm';

import { TenantContextService } from '../tenancy/tenant-context.service';

import { OutboxMessage } from './outbox-message.entity';


// Publishes domain events via the transactional outbox. The publisher does not
// know or care who consumes the event (plan.md §5.2) — it just records it.
@Injectable()
export class DomainEventPublisher {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly tenantContext: TenantContextService,
  ) {}

  // Write the event in the caller's existing transaction. Use this from a service
  // that is already mutating state inside `dataSource.transaction(...)`, so the
  // business change and its event commit atomically.
  async publishWithin(manager: EntityManager, input: DomainEventInput): Promise<OutboxMessage> {
    const message = manager.create(OutboxMessage, {
      organizationId: this.tenantContext.getOrganizationId(),
      eventName: input.name,
      payload: input.payload as Record<string, unknown>,
      occurredAt: new Date(),
      version: 1,
      status: 'pending',
      attempts: 0,
      processedAt: null,
      lastError: null,
    });
    return manager.save(message);
  }

  // Convenience for a publish that is not already inside a business transaction.
  async publish(input: DomainEventInput): Promise<OutboxMessage> {
    return this.dataSource.transaction((manager) => this.publishWithin(manager, input));
  }
}
