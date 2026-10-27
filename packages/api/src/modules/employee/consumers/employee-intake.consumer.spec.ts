import type { DomainEvent, FormTarget } from '@hrms/shared';
import { toId, type FormId, type FormSubmissionId, type OrganizationId } from '@hrms/shared';
import type { EntityManager } from 'typeorm';

import type { EventBus } from '../../../core/events/event-bus.service';
import type { IdempotencyService } from '../../../core/events/idempotency.service';
import type { TenantContextService } from '../../../core/tenancy/tenant-context.service';
import type { EmployeeIntakeService } from '../employee-intake.service';

import { EmployeeIntakeConsumer } from './employee-intake.consumer';

const TETHR = toId<OrganizationId>('org-tethr');
const SUBMISSION = toId<FormSubmissionId>('submission-1');
const FORM = toId<FormId>('form-1');

const buildConsumer = (options: { target?: FormTarget; simulateLedger?: boolean } = {}) => {
  let handler: ((event: DomainEvent) => Promise<void>) | null = null;
  const eventBus = {
    register: jest.fn(
      (_name: string, _consumerName: string, next: (event: DomainEvent) => Promise<void>) => {
        handler = next;
      },
    ),
  } as unknown as EventBus;
  const manager = { id: 'manager' } as unknown as EntityManager;

  // With `simulateLedger`, runOnce behaves like the real idempotency ledger:
  // the first event runs its work, a redelivery of the same eventId is a no-op.
  const processedEventIds = new Set<string>();
  const idempotency = {
    runOnce: jest.fn(
      (
        _name: string,
        event: DomainEvent,
        work: (manager: EntityManager) => Promise<unknown>,
      ) => {
        if (options.simulateLedger && processedEventIds.has(event.eventId)) {
          return Promise.resolve();
        }
        processedEventIds.add(event.eventId);
        return work(manager);
      },
    ),
  } as unknown as IdempotencyService;

  const intake = {
    applyIntakeSubmission: jest.fn().mockResolvedValue({ id: 'employee-1' }),
  } as unknown as EmployeeIntakeService;
  const visitedTenants: string[] = [];
  const tenantContext = {
    run: jest.fn((context: { organizationId: string }, work: () => Promise<unknown>) => {
      visitedTenants.push(context.organizationId);
      return work();
    }),
  } as unknown as TenantContextService;

  const consumer = new EmployeeIntakeConsumer(eventBus, idempotency, tenantContext, intake);
  consumer.onModuleInit();

  const event = {
    eventId: 'event-1',
    name: 'form.submitted',
    tenantId: TETHR,
    occurredAt: new Date().toISOString(),
    version: 1,
    payload: { formId: FORM, submissionId: SUBMISSION, target: options.target ?? 'employeeIntake' },
  } as DomainEvent;

  return {
    dispatch: () => {
      if (!handler) throw new Error('consumer did not register a handler');
      return handler(event);
    },
    eventBus,
    idempotency,
    intake,
    visitedTenants,
  };
};

describe('EmployeeIntakeConsumer', () => {
  it('registers on the event bus under its ledger name', () => {
    const { eventBus } = buildConsumer();

    expect(eventBus.register).toHaveBeenCalledWith(
      'form.submitted',
      'employee.employee-intake',
      expect.any(Function),
    );
  });

  it('projects the submission inside the event tenant on the ledger transaction', async () => {
    const { dispatch, intake, visitedTenants } = buildConsumer();

    await dispatch();

    expect(intake.applyIntakeSubmission).toHaveBeenCalledWith(SUBMISSION, expect.anything());
    // The tenant comes from the event, not any ambient request context.
    expect(visitedTenants).toEqual([TETHR]);
  });

  it('ignores submissions that target other form kinds', async () => {
    for (const target of ['application', 'generic'] as const) {
      const { dispatch, intake, idempotency, visitedTenants } = buildConsumer({ target });

      await dispatch();

      expect(intake.applyIntakeSubmission).not.toHaveBeenCalled();
      expect(idempotency.runOnce).not.toHaveBeenCalled();
      expect(visitedTenants).toEqual([]);
    }
  });

  it('does not project the same event twice', async () => {
    const { dispatch, intake } = buildConsumer({ simulateLedger: true });

    await dispatch();
    await dispatch();

    expect(intake.applyIntakeSubmission).toHaveBeenCalledTimes(1);
  });
});
