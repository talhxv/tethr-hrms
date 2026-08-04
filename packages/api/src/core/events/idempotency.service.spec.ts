import { toId, type OrganizationId, type DomainEvent } from '@hrms/shared';
import type { DataSource, EntityManager } from 'typeorm';

import { IdempotencyService } from './idempotency.service';

const event: DomainEvent<'employee.terminated'> = {
  eventId: 'evt-1',
  name: 'employee.terminated',
  payload: { employeeId: toId('emp-1'), effectiveDate: '2026-06-18', reason: 'resignation' },
  tenantId: toId<OrganizationId>('org-1'),
  occurredAt: '2026-06-18T00:00:00.000Z',
  version: 1,
};

const makeService = (existing: unknown) => {
  const manager = {
    findOne: jest.fn().mockResolvedValue(existing),
    insert: jest.fn().mockResolvedValue(undefined),
  } as unknown as EntityManager;
  const dataSource = {
    transaction: jest.fn((callback: (m: EntityManager) => Promise<void>) => callback(manager)),
  } as unknown as DataSource;
  return { service: new IdempotencyService(dataSource), manager };
};

describe('IdempotencyService', () => {
  it('runs the handler and records the marker the first time', async () => {
    const { service, manager } = makeService(null);
    const handler = jest.fn().mockResolvedValue(undefined);

    await service.runOnce('auth.disable-login', event, handler);

    expect(manager.insert).toHaveBeenCalled();
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('skips the handler when the event was already processed', async () => {
    const { service, manager } = makeService({ id: 'existing' });
    const handler = jest.fn().mockResolvedValue(undefined);

    await service.runOnce('auth.disable-login', event, handler);

    expect(manager.insert).not.toHaveBeenCalled();
    expect(handler).not.toHaveBeenCalled();
  });
});
