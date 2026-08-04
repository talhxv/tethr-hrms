import type { DomainEvent } from '@hrms/shared';
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { EventBus } from './event-bus.service';
import { OutboxMessage } from './outbox-message.entity';


const MAX_ATTEMPTS = 5;

// Delivers pending outbox messages to in-process consumers. Invoked on an
// interval by the worker. Safe to run repeatedly and concurrently because
// consumers dedupe on eventId (see IdempotencyService).
@Injectable()
export class OutboxRelay {
  private readonly logger = new Logger(OutboxRelay.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly eventBus: EventBus,
  ) {}

  async relayPendingBatch(limit = 100): Promise<number> {
    const repository = this.dataSource.getRepository(OutboxMessage);
    const pending = await repository.find({
      where: { status: 'pending' },
      order: { occurredAt: 'ASC' },
      take: limit,
    });

    let processedCount = 0;
    for (const message of pending) {
      try {
        await this.eventBus.dispatch(this.toDomainEvent(message));
        message.status = 'processed';
        message.processedAt = new Date();
        message.lastError = null;
        await repository.save(message);
        processedCount += 1;
      } catch (error) {
        message.attempts += 1;
        message.lastError = error instanceof Error ? error.message : String(error);
        message.status = message.attempts >= MAX_ATTEMPTS ? 'failed' : 'pending';
        await repository.save(message);
        this.logger.error(
          `Outbox message ${message.id} failed (attempt ${message.attempts})`,
          message.lastError,
        );
      }
    }
    return processedCount;
  }

  // Rehydrate the typed event from the stored row. The payload was persisted as
  // an opaque jsonb blob and the row's `eventName` column is the broad union, so
  // this is the deserialization trust boundary — assert the discriminated shape.
  private toDomainEvent(message: OutboxMessage): DomainEvent {
    return {
      eventId: message.id,
      name: message.eventName,
      payload: message.payload,
      tenantId: message.organizationId,
      occurredAt: message.occurredAt.toISOString(),
      version: message.version,
    } as unknown as DomainEvent;
  }
}
