import { toId, type EmployeeId, type OrganizationId } from '@hrms/shared';
import type { DataSource, EntityManager } from 'typeorm';

import { AttendanceService } from './attendance.service';

import type { TenantContextService } from '../../core/tenancy/tenant-context.service';
import type { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';
import type { ClockEvent } from './entities/clock-event.entity';
import type { TimeEntry } from './entities/time-entry.entity';

const ORG = toId<OrganizationId>('org-1');
const EMPLOYEE = toId<EmployeeId>('emp-1');

const buildService = (lastEvent: Partial<ClockEvent> | null) => {
  const manager = {
    findOne: jest.fn().mockResolvedValue(lastEvent),
    create: jest.fn((_entity: unknown, data: unknown) => data),
    save: jest.fn((value: Record<string, unknown>) => Promise.resolve({ id: 'generated', ...value })),
  } as unknown as EntityManager;
  const dataSource = {
    transaction: jest.fn((callback: (m: EntityManager) => Promise<unknown>) => callback(manager)),
  } as unknown as DataSource;
  const tenantContext = {
    getOrganizationId: jest.fn().mockReturnValue(ORG),
  } as unknown as TenantContextService;
  const service = new AttendanceService(
    {} as unknown as TenantScopedRepository<ClockEvent>,
    {} as unknown as TenantScopedRepository<TimeEntry>,
    dataSource,
    tenantContext,
  );
  return { service };
};

describe('AttendanceService.clockOut', () => {
  it('pairs with the open clock-in and computes worked hours', async () => {
    const openIn = { type: 'in', occurredAt: new Date('2026-06-15T09:00:00Z') } as ClockEvent;
    const { service } = buildService(openIn);

    const entry = await service.clockOut(EMPLOYEE, '2026-06-15T17:30:00Z');

    expect(entry.hours).toBe('8.50');
    expect(entry.date).toBe('2026-06-15');
  });

  it('throws when there is no open clock-in to close', async () => {
    const alreadyClosed = {
      type: 'out',
      occurredAt: new Date('2026-06-15T17:00:00Z'),
    } as ClockEvent;
    const { service } = buildService(alreadyClosed);

    await expect(service.clockOut(EMPLOYEE, '2026-06-15T18:00:00Z')).rejects.toThrow(
      /No open clock-in/,
    );
  });
});
