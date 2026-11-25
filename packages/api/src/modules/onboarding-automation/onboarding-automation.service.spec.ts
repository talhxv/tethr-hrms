import { toId, type EmployeeId, type OrganizationId, type UserId } from '@hrms/shared';
import type { DataSource, EntityManager } from 'typeorm';

import { ConflictError, ValidationFailedError } from '../../common/errors';
import type { AuditService } from '../../core/audit/audit.service';
import type { ConfigService } from '../../core/config/config.service';
import type { DomainEventPublisher } from '../../core/events/domain-event-publisher.service';
import type { TenantContextService } from '../../core/tenancy/tenant-context.service';
import type { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';
import type { EmployeeDirectoryService } from '../employee';
import type { EmployeeProfileService } from '../employee/employee-profile.service';
import type { CompensationService } from '../finance/compensation';
import type { OrganizationService } from '../organization/organization.service';

import type { EmployeeOnboardingStage } from './entities/employee-onboarding-stage.entity';
import type { OnboardingAutomationRun } from './entities/onboarding-automation-run.entity';
import type { OnboardingAutomationSettings } from './entities/onboarding-automation-settings.entity';
import type { OnboardingAutomationDispatcher } from './onboarding-automation.dispatcher';
import { OnboardingAutomationService } from './onboarding-automation.service';

const ORG = toId<OrganizationId>('org-1');
const EMPLOYEE = toId<EmployeeId>('employee-1');
const USER = toId<UserId>('user-1');
const RUN_ID = '8a6b7b0e-6f6b-4f1e-9a51-3f4f0c2d1e11';
const SECRET = 's'.repeat(40);

type Options = {
  readonly secret?: string;
  readonly settings?: Partial<OnboardingAutomationSettings> | null;
  readonly stage?: Partial<EmployeeOnboardingStage> | null;
  readonly inFlight?: Partial<OnboardingAutomationRun> | null;
  readonly run?: Partial<OnboardingAutomationRun> | null;
  readonly delivered?: boolean;
};

const build = (options: Options = {}) => {
  const savedRuns: Record<string, unknown>[] = [];
  const savedStages: Record<string, unknown>[] = [];
  const run = options.run === undefined ? null : options.run;

  const stages = {
    findOne: jest.fn().mockResolvedValue(options.stage ?? null),
    create: jest.fn((value: Record<string, unknown>) => ({ ...value })),
    save: jest.fn((value: Record<string, unknown>) => {
      savedStages.push({ ...value });
      return Promise.resolve({ id: 'stage-1', updatedAt: new Date(), ...value });
    }),
  } as unknown as TenantScopedRepository<EmployeeOnboardingStage>;

  const runs = {
    findOne: jest.fn().mockResolvedValue(options.inFlight ?? null),
    findById: jest.fn().mockResolvedValue(run),
    find: jest.fn().mockResolvedValue([]),
    save: jest.fn((value: Record<string, unknown>) => {
      savedRuns.push({ ...value });
      return Promise.resolve(value);
    }),
    unsafeRepository: { findOne: jest.fn().mockResolvedValue(run) },
  } as unknown as TenantScopedRepository<OnboardingAutomationRun>;

  let settingsRow: Record<string, unknown> | null =
    options.settings === null
      ? null
      : { id: 'settings-1', webhookUrl: 'https://n8n.example.com/webhook/onboarding', enabled: true, ...options.settings };
  const settings = {
    findOne: jest.fn(() => Promise.resolve(settingsRow)),
    create: jest.fn((value: Record<string, unknown>) => ({ ...value })),
    save: jest.fn((value: Record<string, unknown>) => {
      settingsRow = { id: 'settings-1', ...value };
      return Promise.resolve(settingsRow);
    }),
  } as unknown as TenantScopedRepository<OnboardingAutomationSettings>;

  const published: unknown[] = [];
  const manager = {
    create: jest.fn((_entity: unknown, value: Record<string, unknown>) => ({ ...value })),
    save: jest.fn((value: Record<string, unknown>) =>
      Promise.resolve({ id: RUN_ID, createdAt: new Date(), ...value }),
    ),
  } as unknown as EntityManager;
  const dataSource = {
    transaction: jest.fn((work: (target: EntityManager) => Promise<unknown>) => work(manager)),
  } as unknown as DataSource;
  const publisher = {
    publishWithin: jest.fn((_manager: unknown, input: unknown) => {
      published.push(input);
      return Promise.resolve();
    }),
  } as unknown as DomainEventPublisher;
  const audit = { record: jest.fn().mockResolvedValue(undefined) } as unknown as AuditService;
  const tenantContext = {
    getOrganizationId: () => ORG,
    run: <T>(_context: unknown, callback: () => T): T => callback(),
  } as unknown as TenantContextService;
  const config = {
    get: (key: string) =>
      key === 'ONBOARDING_AUTOMATION_SECRET'
        ? options.secret === undefined ? SECRET : options.secret || undefined
        : key === 'PUBLIC_API_URL'
          ? 'https://api.example.com/'
          : key === 'NODE_ENV'
            ? 'production'
            : undefined,
  } as unknown as ConfigService;
  const directory = {
    exists: jest.fn().mockResolvedValue(true),
    getById: jest.fn().mockResolvedValue({
      id: EMPLOYEE,
      employeeNumber: 'TTR-099',
      firstName: 'Alex',
      middleName: null,
      lastName: 'Morgan',
      workEmail: null,
      roleTitle: 'Product Engineer',
      hireDate: '2026-12-01',
      workerType: 'permanent',
      probationEndDate: null,
      noticePeriodDays: 30,
    }),
  } as unknown as EmployeeDirectoryService;
  const profiles = {
    getForEmployee: jest.fn().mockResolvedValue({ personalEmail: 'alex@example.com', phone: null }),
  } as unknown as EmployeeProfileService;
  const compensation = {
    getCurrentSalaryRevision: jest.fn().mockResolvedValue(null),
  } as unknown as CompensationService;
  const organizations = {
    getById: jest.fn().mockResolvedValue({ legalName: 'Tethr', displayName: null }),
  } as unknown as OrganizationService;
  const deliver = jest.fn().mockResolvedValue(
    options.delivered === false
      ? { delivered: false, responseStatus: 500, error: 'The automation answered with HTTP 500.' }
      : { delivered: true, responseStatus: 200, error: null },
  );
  const dispatcher = { deliver } as unknown as OnboardingAutomationDispatcher;

  const service = new OnboardingAutomationService(
    stages,
    runs,
    settings,
    dataSource,
    publisher,
    audit,
    tenantContext,
    config,
    directory,
    profiles,
    compensation,
    organizations,
    dispatcher,
  );
  return { service, published, savedRuns, savedStages, deliver };
};

describe('OnboardingAutomationService', () => {
  it('reads a person with no row as pre-onboarding', async () => {
    const { service } = build();
    await expect(service.getStage(EMPLOYEE)).resolves.toMatchObject({ stage: 'preOnboard' });
  });

  it('queues a run at the current stage and publishes the event in one transaction', async () => {
    const { service, published } = build({ stage: { stage: 'offerLetterReview' } });
    const run = await service.requestRun(EMPLOYEE, USER);
    expect(run).toMatchObject({ status: 'queued', stage: 'offerLetterReview', triggeredByUserId: USER });
    expect(published).toEqual([
      {
        name: 'onboarding.automationRequested',
        payload: { onboardingAutomationRunId: RUN_ID, employeeId: EMPLOYEE, stage: 'offerLetterReview' },
      },
    ]);
  });

  it('refuses to run without the server secret', async () => {
    const { service } = build({ secret: '' });
    await expect(service.requestRun(EMPLOYEE, USER)).rejects.toBeInstanceOf(ValidationFailedError);
  });

  it('refuses to run while automation is switched off', async () => {
    const { service } = build({ settings: { enabled: false } });
    await expect(service.requestRun(EMPLOYEE, USER)).rejects.toBeInstanceOf(ValidationFailedError);
  });

  it('refuses a second run while one is still in progress', async () => {
    const { service } = build({ inFlight: { id: 'run-0', status: 'delivered' } });
    await expect(service.requestRun(EMPLOYEE, USER)).rejects.toBeInstanceOf(ConflictError);
  });

  it('delivers a queued run and marks it delivered', async () => {
    const { service, deliver, savedRuns } = build({
      run: { id: RUN_ID, employeeId: EMPLOYEE, organizationId: ORG, stage: 'preOnboard', status: 'queued', createdAt: new Date(), triggeredByUserId: USER },
    });
    await service.deliverRun(toId(RUN_ID));
    expect(deliver).toHaveBeenCalledTimes(1);
    const body = JSON.parse((deliver.mock.calls[0][0] as { body: string }).body) as {
      callback: { url: string };
      stageLabel: string;
    };
    expect(body.stageLabel).toBe('Pre-Onboard');
    expect(body.callback.url).toBe('https://api.example.com/automations/onboarding/callback');
    expect(savedRuns.at(-1)).toMatchObject({ status: 'delivered', responseStatus: 200 });
  });

  it('records a failed delivery on the run instead of retrying', async () => {
    const { service, savedRuns } = build({
      delivered: false,
      run: { id: RUN_ID, employeeId: EMPLOYEE, organizationId: ORG, stage: 'preOnboard', status: 'queued', createdAt: new Date(), triggeredByUserId: USER },
    });
    await service.deliverRun(toId(RUN_ID));
    expect(savedRuns.at(-1)).toMatchObject({ status: 'failed', responseStatus: 500 });
  });

  it('never delivers a run twice', async () => {
    const { service, deliver } = build({
      run: { id: RUN_ID, employeeId: EMPLOYEE, organizationId: ORG, stage: 'preOnboard', status: 'delivered', createdAt: new Date() },
    });
    await service.deliverRun(toId(RUN_ID));
    expect(deliver).not.toHaveBeenCalled();
  });

  it('moves the stage when the workflow reports success', async () => {
    const { service, savedStages } = build({
      stage: { stage: 'offerLetterReview', employeeId: EMPLOYEE },
      run: { id: RUN_ID, employeeId: EMPLOYEE, organizationId: ORG, stage: 'offerLetterReview', status: 'delivered' },
    });
    const result = await service.completeRun({
      runId: RUN_ID,
      status: 'succeeded',
      stage: 'offerLetterSent',
      message: null,
      documentUrl: 'https://docs.google.com/document/d/xyz',
      documentsFolderUrl: null,
    });
    expect(result).toEqual({ runId: RUN_ID, status: 'succeeded', stage: 'offerLetterSent' });
    expect(savedStages.at(-1)).toMatchObject({ stage: 'offerLetterSent' });
  });

  it('keeps the stage when the workflow reports a failure', async () => {
    const { service, savedStages } = build({
      stage: { stage: 'offerLetterReview', employeeId: EMPLOYEE },
      run: { id: RUN_ID, employeeId: EMPLOYEE, organizationId: ORG, stage: 'offerLetterReview', status: 'delivered' },
    });
    const result = await service.completeRun({
      runId: RUN_ID,
      status: 'failed',
      stage: 'offerLetterSent',
      message: 'Template missing',
      documentUrl: null,
      documentsFolderUrl: null,
    });
    expect(result).toEqual({ runId: RUN_ID, status: 'failed', stage: 'offerLetterReview' });
    expect(savedStages).toHaveLength(0);
  });

  it('answers an unknown run with null', async () => {
    const { service } = build({ run: null });
    await expect(
      service.completeRun({
        runId: RUN_ID,
        status: 'succeeded',
        stage: null,
        message: null,
        documentUrl: null,
        documentsFolderUrl: null,
      }),
    ).resolves.toBeNull();
  });

  it('refuses to switch automation on without a webhook URL, and plain http in production', async () => {
    const { service } = build({ settings: null });
    await expect(
      service.updateSettings({ webhookUrl: null, enabled: true, userId: USER }),
    ).rejects.toBeInstanceOf(ValidationFailedError);
    await expect(
      service.updateSettings({ webhookUrl: 'http://n8n.example.com/webhook/x', enabled: true, userId: USER }),
    ).rejects.toBeInstanceOf(ValidationFailedError);
    await expect(
      service.updateSettings({ webhookUrl: 'https://n8n.example.com/webhook/x', enabled: true, userId: USER }),
    ).resolves.toMatchObject({ enabled: true, ready: true });
  });
});
