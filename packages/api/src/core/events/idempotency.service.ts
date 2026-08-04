import type { DomainEvent } from '@hrms/shared';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { ProcessedEvent } from './processed-event.entity';


// Guarantees a consumer runs its side effect for a given event at most once. The
// unique index on (consumerName, eventId) is the hard guarantee; if the handler
// throws, the surrounding transaction rolls back — including the ledger row — so
// the event is retried cleanly later.
@Injectable()
export class IdempotencyService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async runOnce(
    consumerName: string,
    event: DomainEvent,
    handler: () => Promise<void>,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const alreadyProcessed = await manager.findOne(ProcessedEvent, {
        where: { consumerName, eventId: event.eventId },
      });
      if (alreadyProcessed) {
        return;
      }
      await manager.insert(ProcessedEvent, {
        organizationId: event.tenantId,
        consumerName,
        eventId: event.eventId,
        processedAt: new Date(),
      });
      await handler();
    });
  }
}
