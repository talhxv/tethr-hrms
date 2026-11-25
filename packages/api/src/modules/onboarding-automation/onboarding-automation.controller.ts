import {
  Body,
  Controller,
  Headers,
  HttpCode,
  NotFoundException,
  Post,
  ServiceUnavailableException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { ConfigService } from '../../core/config/config.service';

import { isAuthorizedBearer, parseCallback } from './onboarding-automation.contract';
import { OnboardingAutomationService } from './onboarding-automation.service';

// The workflow's way back in: when n8n finishes a step it POSTs the outcome
// here (the same job its "Update Notion page" node did). Authenticated with the
// shared secret as a bearer token — there is no user session on this route.
@Controller('automations/onboarding')
export class OnboardingAutomationController {
  constructor(
    private readonly config: ConfigService,
    private readonly automation: OnboardingAutomationService,
  ) {}

  @Post('callback')
  @HttpCode(200)
  async callback(
    @Headers('authorization') authorization: string | undefined,
    // Typed as unknown so the global ValidationPipe leaves it alone; the body is
    // validated by the contract's own schema (which ignores extra fields).
    @Body() body: unknown,
  ): Promise<{ readonly ok: true; readonly runId: string; readonly status: string; readonly stage: string }> {
    const secret = this.config.get('ONBOARDING_AUTOMATION_SECRET');
    if (!secret) {
      throw new ServiceUnavailableException('Onboarding automation is not configured');
    }
    if (!isAuthorizedBearer(authorization, secret)) {
      throw new UnauthorizedException('Invalid automation credentials');
    }
    const parsed = parseCallback(body);
    if (!parsed.ok) {
      throw new BadRequestException(parsed.error);
    }
    const result = await this.automation.completeRun(parsed.value);
    if (!result) {
      throw new NotFoundException('Unknown automation run');
    }
    return { ok: true, ...result };
  }
}
