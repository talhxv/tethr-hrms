import {
  toId,
  type EmployeeId,
  type EmployeeFeedbackId,
  type OrganizationId,
  type UserId,
} from '@hrms/shared';
import type { DataSource, EntityManager } from 'typeorm';

import type { AuditService } from '../../core/audit/audit.service';
import type { DomainEventPublisher } from '../../core/events/domain-event-publisher.service';
import type { TenantContextService } from '../../core/tenancy/tenant-context.service';
import type { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';

import { EngagementService } from './engagement.service';
import { Announcement } from './entities/announcement.entity';
import { EmployeeFeedback } from './entities/employee-feedback.entity';

const ORGANIZATION = toId<OrganizationId>('org-1');
const USER = toId<UserId>('user-1');
const EMPLOYEE = toId<EmployeeId>('employee-1');
const FEEDBACK = toId<EmployeeFeedbackId>('feedback-1');

const buildService = (announcements: Announcement[] = []) => {
  const announcementRepository = {
    find: jest.fn().mockResolvedValue(announcements),
  } as unknown as TenantScopedRepository<Announcement>;
  const feedbackRepository = {
    find: jest.fn().mockResolvedValue([]),
  } as unknown as TenantScopedRepository<EmployeeFeedback>;
  const manager = {
    create: jest.fn((_entity: unknown, value: unknown) => value),
    save: jest.fn((value: Record<string, unknown>) =>
      Promise.resolve({ id: FEEDBACK, createdAt: new Date(), updatedAt: new Date(), ...value }),
    ),
    findOne: jest.fn().mockResolvedValue(null),
  } as unknown as EntityManager;
  const dataSource = {
    transaction: jest.fn((callback: (transactionManager: EntityManager) => Promise<unknown>) =>
      callback(manager),
    ),
  } as unknown as DataSource;
  const publisher = {
    publishWithin: jest.fn().mockResolvedValue(undefined),
  } as unknown as DomainEventPublisher;
  const tenantContext = {
    getOrganizationId: jest.fn().mockReturnValue(ORGANIZATION),
  } as unknown as TenantContextService;
  const audit = { record: jest.fn().mockResolvedValue(undefined) } as unknown as AuditService;

  return {
    service: new EngagementService(
      announcementRepository,
      feedbackRepository,
      dataSource,
      publisher,
      tenantContext,
      audit,
    ),
    publisher,
  };
};

const announcement = (
  id: string,
  audience: Announcement['audience'],
  expiresAt: Date | null = null,
): Announcement =>
  ({
    id,
    title: id,
    body: 'Body',
    audience,
    isPinned: false,
    publishedAt: new Date('2026-01-01T00:00:00.000Z'),
    expiresAt,
  }) as Announcement;

describe('EngagementService', () => {
  it('filters announcements by the current portal audience', async () => {
    const { service } = buildService([
      announcement('global', 'all'),
      announcement('client-only', 'client'),
      announcement('employee-only', 'employee'),
      announcement('expired', 'client', new Date('2020-01-01T00:00:00.000Z')),
    ]);

    const visible = await service.listAnnouncements('client');

    expect(visible.map((item) => item.id)).toEqual(['global', 'client-only']);
  });

  it('submits employee feedback and emits an outbox event in the transaction', async () => {
    const { service, publisher } = buildService();

    const feedback = await service.submitFeedback({
      employeeId: EMPLOYEE,
      submittedByUserId: USER,
      category: 'general',
      subject: 'Payroll question',
      body: 'Please review the latest payroll note.',
    });

    expect(feedback.status).toBe('submitted');
    expect(publisher.publishWithin).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ name: 'employeeFeedback.submitted' }),
    );
  });
});
