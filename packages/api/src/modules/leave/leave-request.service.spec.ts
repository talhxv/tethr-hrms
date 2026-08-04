import {
  toId,
  type EmployeeId,
  type LeaveTypeId,
  type OrganizationId,
  type UserId,
} from '@hrms/shared';
import type { DataSource, EntityManager } from 'typeorm';

import type { AuditService } from '../../core/audit/audit.service';
import type { DomainEventPublisher } from '../../core/events/domain-event-publisher.service';
import type { TenantContextService } from '../../core/tenancy/tenant-context.service';
import type { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';
import type { WorkflowService } from '../../core/workflow/workflow.service';

import type { LeaveBalance } from './entities/leave-balance.entity';
import type { LeaveRequest } from './entities/leave-request.entity';
import type { LeaveType } from './entities/leave-type.entity';
import type { HolidayService } from './holiday.service';
import { LeaveRequestService } from './leave-request.service';

const ORG = toId<OrganizationId>('org-1');
const EMPLOYEE = toId<EmployeeId>('emp-1');
const LEAVE_TYPE = toId<LeaveTypeId>('lt-1');
const APPROVER = toId<UserId>('user-1');

const buildService = (options: { leaveType?: Partial<LeaveType>; managerFindOne?: jest.Mock }) => {
  const leaveType = {
    id: 'lt-1',
    requiresApproval: false,
    defaultAnnualEntitlement: '20.00',
    ...(options.leaveType ?? {}),
  } as LeaveType;

  const requests = {
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn((value: unknown) => Promise.resolve(value)),
  } as unknown as TenantScopedRepository<LeaveRequest>;
  const leaveTypes = {
    findById: jest.fn().mockResolvedValue(leaveType),
  } as unknown as TenantScopedRepository<LeaveType>;
  const manager = {
    findOne: options.managerFindOne ?? jest.fn().mockResolvedValue(null),
    create: jest.fn((_entity: unknown, data: unknown) => data),
    save: jest.fn((value: Record<string, unknown>) =>
      Promise.resolve({ id: 'generated-id', ...value }),
    ),
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
  const holidayService = {
    getHolidayDates: jest.fn().mockResolvedValue(new Set<string>()),
  } as unknown as HolidayService;
  const workflowService = {
    requestApproval: jest.fn().mockResolvedValue({ id: 'approval-1' }),
  } as unknown as WorkflowService;
  const audit = { record: jest.fn().mockResolvedValue(undefined) } as unknown as AuditService;

  const service = new LeaveRequestService(
    requests,
    leaveTypes,
    dataSource,
    publisher,
    tenantContext,
    holidayService,
    workflowService,
    audit,
  );
  return { service, publisher };
};

describe('LeaveRequestService.submit', () => {
  it('costs the request in working days, reserves balance, and emits leave.requested', async () => {
    const { service, publisher } = buildService({});
    // Mon 2026-06-15 .. Fri 2026-06-19 = 5 working days.
    const request = await service.submit({
      employeeId: EMPLOYEE,
      leaveTypeId: LEAVE_TYPE,
      startDate: '2026-06-15',
      endDate: '2026-06-19',
    });
    expect(request.dayCount).toBe('5.00');
    expect(publisher.publishWithin).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: 'leave.requested' }),
    );
  });

  it('rejects when the balance is insufficient', async () => {
    const { service } = buildService({ leaveType: { defaultAnnualEntitlement: '2.00' } });
    await expect(
      service.submit({
        employeeId: EMPLOYEE,
        leaveTypeId: LEAVE_TYPE,
        startDate: '2026-06-15',
        endDate: '2026-06-19',
      }),
    ).rejects.toThrow(/Insufficient/);
  });

  it('rejects an inverted date range', async () => {
    const { service } = buildService({});
    await expect(
      service.submit({
        employeeId: EMPLOYEE,
        leaveTypeId: LEAVE_TYPE,
        startDate: '2026-06-19',
        endDate: '2026-06-15',
      }),
    ).rejects.toThrow(/on or before/);
  });
});

describe('LeaveRequestService.approve', () => {
  it('releases the pending reservation, books used days, and emits leave.approved', async () => {
    const pendingRequest = {
      id: 'lr-1',
      employeeId: EMPLOYEE,
      leaveTypeId: LEAVE_TYPE,
      startDate: '2026-06-15',
      endDate: '2026-06-19',
      dayCount: '5.00',
      status: 'pending',
    } as LeaveRequest;
    const balance = {
      id: 'bal-1',
      pendingDays: '5.00',
      usedDays: '0',
      entitledDays: '20.00',
    } as LeaveBalance;
    const managerFindOne = jest
      .fn()
      .mockResolvedValueOnce(pendingRequest)
      .mockResolvedValueOnce(balance);

    const { service, publisher } = buildService({ managerFindOne });
    await service.approve('lr-1', APPROVER);

    expect(balance.pendingDays).toBe('0.00');
    expect(balance.usedDays).toBe('5.00');
    expect(publisher.publishWithin).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: 'leave.approved' }),
    );
  });
});
