import type { DomainEvent } from '@hrms/shared';
import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { EventBus } from '../../../core/events/event-bus.service';
import { IdempotencyService } from '../../../core/events/idempotency.service';
import { TenantContextService } from '../../../core/tenancy/tenant-context.service';
import { EmployeeIntakeService } from '../employee-intake.service';

const CONSUMER_NAME = 'employee.employee-intake';

// Turns an employee-intake form submission into an Employee record inside the
// workspace the link was minted for (the Tethr org). The event is the only
// coupling to the forms module, and the tenant comes from the event because
// the relay runs outside a request. The resulting `employee.created` event
// then seeds the standard onboarding checklist — that flow is untouched.
@Injectable()
export class EmployeeIntakeConsumer implements OnModuleInit {
  private readonly logger = new Logger(EmployeeIntakeConsumer.name);

  constructor(
    private readonly eventBus: EventBus,
    private readonly idempotency: IdempotencyService,
    private readonly tenantContext: TenantContextService,
    private readonly intake: EmployeeIntakeService,
  ) {}

  onModuleInit(): void {
    this.eventBus.register('form.submitted', CONSUMER_NAME, (event) => this.handle(event));
  }

  private async handle(event: DomainEvent): Promise<void> {
    // Other targets (applications, generic forms) are somebody else's
    // submission: inequality, not an exhaustiveness assert, so a future target
    // simply never reaches this consumer.
    if (event.name !== 'form.submitted' || event.payload.target !== 'employeeIntake') {
      return;
    }
    const { submissionId } = event.payload;
    await this.idempotency.runOnce(CONSUMER_NAME, event, (manager) =>
      this.tenantContext.run({ organizationId: event.tenantId, userId: null }, async () => {
        const employee = await this.intake.applyIntakeSubmission(submissionId, manager);
        if (employee) {
          this.logger.log(`Employee ${employee.id} created from submission ${submissionId}`);
        }
      }),
    );
  }
}
