import type { DomainEvent } from '@hrms/shared';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { EventBus } from '../../../core/events/event-bus.service';
import { IdempotencyService } from '../../../core/events/idempotency.service';
import { TenantContextService } from '../../../core/tenancy/tenant-context.service';
import { OnboardingAutomationService } from '../onboarding-automation.service';

const CONSUMER_NAME = 'onboarding-automation.deliver-run';

// "Run automation" → POST the run to the onboarding workflow (n8n). The webhook
// is an external side effect, so it cannot join the idempotency transaction;
// the run's own status ('queued' only) is the second guard against a replayed
// event delivering twice.
@Injectable()
export class OnboardingAutomationRequestedConsumer implements OnModuleInit {
  private readonly logger = new Logger(OnboardingAutomationRequestedConsumer.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly idempotency: IdempotencyService,
    private readonly tenantContext: TenantContextService,
    private readonly automation: OnboardingAutomationService,
  ) {}

  onModuleInit(): void {
    this.eventBus.register('onboarding.automationRequested', CONSUMER_NAME, (event) =>
      this.handle(event),
    );
  }

  private async handle(event: DomainEvent): Promise<void> {
    if (event.name !== 'onboarding.automationRequested') {
      return;
    }
    const { onboardingAutomationRunId } = event.payload;
    await this.idempotency.runOnce(CONSUMER_NAME, event, () =>
      this.tenantContext.run({ organizationId: event.tenantId, userId: null }, async () => {
        await this.automation.deliverRun(onboardingAutomationRunId);
        this.logger.log(`Processed onboarding automation run ${onboardingAutomationRunId}`);
      }),
    );
  }
}
