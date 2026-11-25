import {
  compareIsoDate,
  toId,
  type EmployeeId,
  type IsoDate,
  type OnboardingAutomationRunId,
  type OnboardingAutomationStage,
  type OrganizationId,
  type UserId,
} from '@hrms/shared';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, MoreThan, type FindOptionsWhere } from 'typeorm';

import { ConflictError, NotFoundError, ValidationFailedError } from '../../common/errors';
import { AuditService } from '../../core/audit/audit.service';
import { ConfigService } from '../../core/config/config.service';
import { DomainEventPublisher } from '../../core/events/domain-event-publisher.service';
import { TenantContextService } from '../../core/tenancy/tenant-context.service';
import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';
import { EmployeeDirectoryService } from '../employee';
import { EmployeeProfileService } from '../employee/employee-profile.service';
import { CompensationService } from '../finance/compensation';
import { OrganizationService } from '../organization/organization.service';

import { EmployeeOnboardingStage } from './entities/employee-onboarding-stage.entity';
import { OnboardingAutomationRun } from './entities/onboarding-automation-run.entity';
import { OnboardingAutomationSettings } from './entities/onboarding-automation-settings.entity';
import {
  buildPayload,
  type OnboardingAutomationCallback,
} from './onboarding-automation.contract';
import { OnboardingAutomationDispatcher } from './onboarding-automation.dispatcher';
import {
  EMPLOYEE_ONBOARDING_STAGE_REPOSITORY,
  ONBOARDING_AUTOMATION_RUN_REPOSITORY,
  ONBOARDING_AUTOMATION_SETTINGS_REPOSITORY,
} from './onboarding-automation.tokens';

// A run still waiting on the workflow blocks a second press for this long, so a
// double click cannot send the same letter twice. After it, a run that never
// reported back no longer blocks — HR can try again.
const IN_FLIGHT_WINDOW_MS = 10 * 60 * 1000;
const RUN_HISTORY_LIMIT = 10;

export type EmployeeOnboardingStageRecord = {
  readonly employeeId: EmployeeId;
  readonly stage: OnboardingAutomationStage;
  readonly documentsFolderUrl: string | null;
  readonly updatedAt: Date | null;
};

export type OnboardingAutomationSettingsRecord = {
  readonly webhookUrl: string | null;
  readonly enabled: boolean;
  readonly secretConfigured: boolean;
  readonly callbackPath: string;
  readonly ready: boolean;
};

// Onboarding automation: records where each person is in the document pipeline
// and hands "Run automation" to the external workflow (n8n). The workflow owns
// what happens at each stage (draft the offer letter, send the form, ...); the
// HRMS owns the stage, the trigger, and the history. The run is delivered by an
// outbox consumer, never inside the request (plan.md §5.2).
@Injectable()
export class OnboardingAutomationService {
  private readonly logger = new Logger(OnboardingAutomationService.name);

  constructor(
    @Inject(EMPLOYEE_ONBOARDING_STAGE_REPOSITORY)
    private readonly stages: TenantScopedRepository<EmployeeOnboardingStage>,
    @Inject(ONBOARDING_AUTOMATION_RUN_REPOSITORY)
    private readonly runs: TenantScopedRepository<OnboardingAutomationRun>,
    @Inject(ONBOARDING_AUTOMATION_SETTINGS_REPOSITORY)
    private readonly settings: TenantScopedRepository<OnboardingAutomationSettings>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly publisher: DomainEventPublisher,
    private readonly audit: AuditService,
    private readonly tenantContext: TenantContextService,
    private readonly config: ConfigService,
    private readonly directory: EmployeeDirectoryService,
    private readonly profiles: EmployeeProfileService,
    private readonly compensation: CompensationService,
    private readonly organizations: OrganizationService,
    private readonly dispatcher: OnboardingAutomationDispatcher,
  ) {}

  // ---- Stage ----

  async getStage(employeeId: EmployeeId): Promise<EmployeeOnboardingStageRecord> {
    await this.assertEmployeeExists(employeeId);
    const row = await this.findStageRow(employeeId);
    return row
      ? toStageRecord(row)
      : { employeeId, stage: 'preOnboard', documentsFolderUrl: null, updatedAt: null };
  }

  // HR moves a person by hand — the same thing changing the Status tag in Notion
  // did, e.g. marking a reviewed letter ready before running the next step.
  async setStage(input: {
    readonly employeeId: EmployeeId;
    readonly stage: OnboardingAutomationStage;
    readonly documentsFolderUrl?: string | null;
    readonly userId: UserId;
  }): Promise<EmployeeOnboardingStageRecord> {
    await this.assertEmployeeExists(input.employeeId);
    const before = await this.findStageRow(input.employeeId);
    const row =
      before ??
      this.stages.create({
        employeeId: input.employeeId,
        stage: 'preOnboard',
        documentsFolderUrl: null,
      });
    const previousStage = before?.stage ?? 'preOnboard';
    row.stage = input.stage;
    if (input.documentsFolderUrl !== undefined) row.documentsFolderUrl = input.documentsFolderUrl;
    row.updatedByUserId = input.userId;
    const saved = await this.stages.save(row);
    await this.audit.record({
      action: 'setStage',
      resourceType: 'employee_onboarding_stage',
      resourceId: saved.id,
      before: { stage: previousStage },
      after: { employeeId: input.employeeId, stage: saved.stage },
    });
    return toStageRecord(saved);
  }

  listRuns(employeeId: EmployeeId): Promise<OnboardingAutomationRun[]> {
    return this.runs.find({
      where: { employeeId } as FindOptionsWhere<OnboardingAutomationRun>,
      order: { createdAt: 'DESC' },
      take: RUN_HISTORY_LIMIT,
    });
  }

  // ---- Run ----

  // "Run automation": record the run and its event in one transaction; the
  // outbox relay delivers it to the workflow a few seconds later.
  async requestRun(employeeId: EmployeeId, userId: UserId): Promise<OnboardingAutomationRun> {
    await this.assertEmployeeExists(employeeId);
    const settings = await this.getSettings();
    if (!settings.secretConfigured) {
      throw new ValidationFailedError(
        'Onboarding automation is not set up on the server yet (missing shared secret).',
      );
    }
    if (!settings.enabled || !settings.webhookUrl) {
      throw new ValidationFailedError(
        'Onboarding automation is switched off. An admin can turn it on in Settings → Automations.',
      );
    }

    const inFlight = await this.runs.findOne({
      where: [
        {
          employeeId,
          status: 'queued',
          createdAt: MoreThan(new Date(Date.now() - IN_FLIGHT_WINDOW_MS)),
        },
        {
          employeeId,
          status: 'delivered',
          createdAt: MoreThan(new Date(Date.now() - IN_FLIGHT_WINDOW_MS)),
        },
      ] as FindOptionsWhere<OnboardingAutomationRun>[],
    });
    if (inFlight) {
      throw new ConflictError(
        'An automation run for this person is still in progress. Wait for it to finish before running again.',
        { runId: inFlight.id },
      );
    }

    const { stage } = await this.getStage(employeeId);
    const organizationId = this.tenantContext.getOrganizationId();
    const run = await this.dataSource.transaction(async (manager) => {
      const created = await manager.save(
        manager.create(OnboardingAutomationRun, {
          organizationId,
          employeeId,
          stage,
          status: 'queued',
          triggeredByUserId: userId,
          deliveredAt: null,
          completedAt: null,
          responseStatus: null,
          resultStage: null,
          documentUrl: null,
          message: null,
        }),
      );
      await this.publisher.publishWithin(manager, {
        name: 'onboarding.automationRequested',
        payload: {
          onboardingAutomationRunId: toId<OnboardingAutomationRunId>(created.id),
          employeeId,
          stage,
        },
      });
      return created;
    });
    await this.audit.record({
      action: 'runAutomation',
      resourceType: 'onboarding_automation_run',
      resourceId: run.id,
      after: { employeeId, stage },
    });
    return run;
  }

  // Outbox consumer side: build the payload and POST it. Runs inside the tenant
  // the event carries. A failed delivery is recorded on the run (HR sees why)
  // rather than retried, so a letter is never sent twice behind HR's back.
  async deliverRun(runId: OnboardingAutomationRunId): Promise<void> {
    const run = await this.runs.findById(runId);
    if (!run || run.status !== 'queued') return;

    const secret = this.config.get('ONBOARDING_AUTOMATION_SECRET');
    const settings = await this.findSettingsRow();
    if (!secret || !settings?.enabled || !settings.webhookUrl) {
      await this.failRun(run, null, 'Onboarding automation was switched off before the run was sent.');
      return;
    }

    const employee = await this.directory.getById(run.employeeId);
    if (!employee) {
      await this.failRun(run, null, 'The employee record no longer exists.');
      return;
    }
    const [profile, stageRow, organization] = await Promise.all([
      this.profiles.getForEmployee(run.employeeId),
      this.findStageRow(run.employeeId),
      this.organizations.getById(this.tenantContext.getOrganizationId()),
    ]);
    const today = new Date().toISOString().slice(0, 10) as IsoDate;
    const asOf = compareIsoDate(employee.hireDate, today) > 0 ? employee.hireDate : today;
    const salary = await this.compensation
      .getCurrentSalaryRevision(run.employeeId, asOf)
      .catch(() => null);

    const payload = buildPayload({
      runId: run.id,
      requestedAt: run.createdAt,
      requestedByUserId: run.triggeredByUserId,
      organizationId: run.organizationId,
      workspaceName: organization?.displayName ?? organization?.legalName ?? '',
      stage: run.stage,
      employee,
      profile: profile
        ? { personalEmail: profile.personalEmail, phone: profile.phone }
        : null,
      documentsFolderUrl: stageRow?.documentsFolderUrl ?? null,
      compensation: salary
        ? { currency: salary.currency, annualAmount: salary.annualAmount, validFrom: salary.validFrom }
        : null,
      publicApiUrl: this.config.get('PUBLIC_API_URL')?.replace(/\/+$/, '') ?? null,
    });

    const result = await this.dispatcher.deliver({
      webhookUrl: settings.webhookUrl,
      secret,
      runId: run.id,
      body: JSON.stringify(payload),
    });
    if (!result.delivered) {
      await this.failRun(run, result.responseStatus, result.error);
      return;
    }
    run.status = 'delivered';
    run.deliveredAt = new Date();
    run.responseStatus = result.responseStatus;
    await this.runs.save(run);
    this.logger.log(`Delivered onboarding automation run ${run.id}`);
  }

  // The workflow reports back. Authenticated by the controller; the run id sets
  // the tenant. Idempotent: a repeated callback for a finished run changes
  // nothing and answers with the current state.
  async completeRun(callback: OnboardingAutomationCallback): Promise<{
    readonly runId: string;
    readonly status: OnboardingAutomationRun['status'];
    readonly stage: OnboardingAutomationStage;
  } | null> {
    // The one unscoped read in this module: the callback arrives without a
    // session, so the run id (bearer-authenticated, a random UUID) is what
    // establishes the tenant. Everything after it runs scoped to that tenant.
    const located = await this.runs.unsafeRepository.findOne({
      where: { id: callback.runId } as FindOptionsWhere<OnboardingAutomationRun>,
    });
    if (!located) return null;
    const organizationId: OrganizationId = located.organizationId;

    return this.tenantContext.run({ organizationId, userId: null }, async () => {
      const run = await this.runs.findById(located.id);
      if (!run) return null;
      if (run.status === 'succeeded' || run.status === 'failed') {
        const current = await this.getStage(run.employeeId);
        return { runId: run.id, status: run.status, stage: current.stage };
      }

      run.status = callback.status;
      run.completedAt = new Date();
      run.resultStage = callback.status === 'succeeded' ? callback.stage : null;
      run.documentUrl = callback.documentUrl ?? run.documentUrl;
      run.message = callback.message;
      await this.runs.save(run);

      let stage = (await this.findStageRow(run.employeeId))?.stage ?? 'preOnboard';
      if (
        (callback.status === 'succeeded' && callback.stage) ||
        callback.documentsFolderUrl
      ) {
        const row =
          (await this.findStageRow(run.employeeId)) ??
          this.stages.create({ employeeId: run.employeeId, stage, documentsFolderUrl: null });
        if (callback.status === 'succeeded' && callback.stage) row.stage = callback.stage;
        if (callback.documentsFolderUrl) row.documentsFolderUrl = callback.documentsFolderUrl;
        row.updatedByUserId = null;
        const saved = await this.stages.save(row);
        stage = saved.stage;
      }

      await this.audit.record({
        action: 'completeAutomation',
        resourceType: 'onboarding_automation_run',
        resourceId: run.id,
        after: {
          employeeId: run.employeeId,
          status: run.status,
          resultStage: run.resultStage,
        },
      });
      return { runId: run.id, status: run.status, stage };
    });
  }

  // ---- Settings ----

  async getSettings(): Promise<OnboardingAutomationSettingsRecord> {
    const row = await this.findSettingsRow();
    const secretConfigured = Boolean(this.config.get('ONBOARDING_AUTOMATION_SECRET'));
    const webhookUrl = row?.webhookUrl ?? null;
    const enabled = row?.enabled ?? false;
    return {
      webhookUrl,
      enabled,
      secretConfigured,
      callbackPath: '/automations/onboarding/callback',
      ready: secretConfigured && enabled && webhookUrl !== null,
    };
  }

  async updateSettings(input: {
    readonly webhookUrl: string | null;
    readonly enabled: boolean;
    readonly userId: UserId;
  }): Promise<OnboardingAutomationSettingsRecord> {
    const webhookUrl = input.webhookUrl?.trim() || null;
    if (webhookUrl !== null) this.assertWebhookUrl(webhookUrl);
    if (input.enabled && webhookUrl === null) {
      throw new ValidationFailedError('Add the workflow webhook URL before turning automation on.');
    }
    const row =
      (await this.findSettingsRow()) ??
      this.settings.create({ webhookUrl: null, enabled: false });
    const before = { webhookUrl: row.webhookUrl, enabled: row.enabled };
    row.webhookUrl = webhookUrl;
    row.enabled = input.enabled;
    row.updatedByUserId = input.userId;
    const saved = await this.settings.save(row);
    await this.audit.record({
      action: 'update',
      resourceType: 'onboarding_automation_settings',
      resourceId: saved.id,
      before,
      after: { webhookUrl: saved.webhookUrl, enabled: saved.enabled },
    });
    return this.getSettings();
  }

  // ---- Internals ----

  private assertWebhookUrl(value: string): void {
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new ValidationFailedError('The webhook URL is not a valid URL.');
    }
    const httpsRequired = this.config.get('NODE_ENV') === 'production';
    if (url.protocol !== 'https:' && (httpsRequired || url.protocol !== 'http:')) {
      throw new ValidationFailedError(
        httpsRequired ? 'The webhook URL must start with https://.' : 'The webhook URL must be http(s).',
      );
    }
  }

  private async assertEmployeeExists(employeeId: EmployeeId): Promise<void> {
    if (!(await this.directory.exists(employeeId))) {
      throw new NotFoundError('Employee not found', { employeeId });
    }
  }

  private findStageRow(employeeId: EmployeeId): Promise<EmployeeOnboardingStage | null> {
    return this.stages.findOne({
      where: { employeeId } as FindOptionsWhere<EmployeeOnboardingStage>,
    });
  }

  private findSettingsRow(): Promise<OnboardingAutomationSettings | null> {
    return this.settings.findOne({ where: {} });
  }

  private async failRun(
    run: OnboardingAutomationRun,
    responseStatus: number | null,
    message: string | null,
  ): Promise<void> {
    run.status = 'failed';
    run.completedAt = new Date();
    run.responseStatus = responseStatus;
    run.message = message;
    await this.runs.save(run);
    this.logger.warn(`Onboarding automation run ${run.id} failed: ${message ?? 'unknown'}`);
  }
}

const toStageRecord = (row: EmployeeOnboardingStage): EmployeeOnboardingStageRecord => ({
  employeeId: row.employeeId,
  stage: row.stage,
  documentsFolderUrl: row.documentsFolderUrl,
  updatedAt: row.updatedAt,
});
