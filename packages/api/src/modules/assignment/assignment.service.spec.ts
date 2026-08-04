import { toId, type EmployeeId, type OrganizationId, type PositionId } from '@hrms/shared';
import type { DataSource, EntityManager } from 'typeorm';


import type { DomainEventPublisher } from '../../core/events/domain-event-publisher.service';
import type { TenantContextService } from '../../core/tenancy/tenant-context.service';
import type { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';

import { AssignmentService } from './assignment.service';
import type { Assignment } from './entities/assignment.entity';

const ORG = toId<OrganizationId>('org-1');
const EMPLOYEE = toId<EmployeeId>('emp-1');
const POSITION = toId<PositionId>('pos-1');

const existingPrimary = {
  id: 'assignment-existing',
  employeeId: EMPLOYEE,
  isPrimary: true,
  validFrom: '2026-01-01',
  validTo: '2026-06-01',
} as Assignment;

const buildService = () => {
  const repository = {
    find: jest.fn().mockResolvedValue([existingPrimary]),
  } as unknown as TenantScopedRepository<Assignment>;
  const manager = {
    create: jest.fn((_entity: unknown, data: unknown) => data),
    save: jest.fn((value: Record<string, unknown>) => Promise.resolve({ ...value, id: 'assignment-new' })),
  } as unknown as EntityManager;
  const dataSource = {
    transaction: jest.fn((callback: (m: EntityManager) => Promise<unknown>) => callback(manager)),
  } as unknown as DataSource;
  const publisher = {
    publishWithin: jest.fn().mockResolvedValue(undefined),
  } as unknown as DomainEventPublisher;
  const tenantContext = {
    getOrganizationId: jest.fn().mockReturnValue(ORG),
  } as unknown as TenantContextService;

  return {
    service: new AssignmentService(repository, dataSource, publisher, tenantContext),
    publisher,
  };
};

describe('AssignmentService.create', () => {
  it('rejects a primary assignment overlapping an existing one', async () => {
    const { service } = buildService();
    await expect(
      service.create({
        employeeId: EMPLOYEE,
        positionId: POSITION,
        validFrom: '2026-03-01', // falls inside the existing [2026-01-01, 2026-06-01)
      }),
    ).rejects.toThrow(/already exists/);
  });

  it('allows a primary assignment that starts after the previous one ends', async () => {
    const { service, publisher } = buildService();
    const assignment = await service.create({
      employeeId: EMPLOYEE,
      positionId: POSITION,
      validFrom: '2026-07-01',
    });
    expect(assignment.id).toBe('assignment-new');
    expect(publisher.publishWithin).toHaveBeenCalled();
  });
});
