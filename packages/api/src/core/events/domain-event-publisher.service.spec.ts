import { toId, type EmployeeId, type OrganizationId } from '@hrms/shared';
import type { DataSource, EntityManager } from 'typeorm';

import type { TenantContextService } from '../tenancy/tenant-context.service';

import { DomainEventPublisher } from './domain-event-publisher.service';
import { OutboxMessage } from './outbox-message.entity';


const ORG = toId<OrganizationId>('org-1');

describe('DomainEventPublisher', () => {
  it('writes a pending outbox row stamped with the current tenant', async () => {
    const manager = {
      create: jest.fn((_entity: unknown, data: unknown) => data),
      save: jest.fn((value: unknown) => Promise.resolve(value)),
    } as unknown as EntityManager;
    const tenantContext = {
      getOrganizationId: jest.fn().mockReturnValue(ORG),
    } as unknown as TenantContextService;
    const publisher = new DomainEventPublisher({} as DataSource, tenantContext);

    await publisher.publishWithin(manager, {
      name: 'employee.created',
      payload: { employeeId: toId<EmployeeId>('emp-1') },
    });

    expect(manager.create).toHaveBeenCalledWith(
      OutboxMessage,
      expect.objectContaining({
        organizationId: ORG,
        eventName: 'employee.created',
        status: 'pending',
        attempts: 0,
      }),
    );
    expect(manager.save).toHaveBeenCalled();
  });
});
