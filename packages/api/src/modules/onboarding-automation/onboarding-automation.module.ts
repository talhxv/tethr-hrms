import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../core/auth/auth.module';
import { AuthzModule } from '../../core/authz/authz.module';
import { provideTenantScopedRepository } from '../../core/tenancy/tenant-repository.provider';
import { EmployeeModule } from '../employee';
import { CompensationModule } from '../finance/compensation';
import { OrganizationModule } from '../organization/organization.module';

import { OnboardingAutomationRequestedConsumer } from './consumers/onboarding-automation-requested.consumer';
import { EmployeeOnboardingStage } from './entities/employee-onboarding-stage.entity';
import { OnboardingAutomationRun } from './entities/onboarding-automation-run.entity';
import { OnboardingAutomationSettings } from './entities/onboarding-automation-settings.entity';
import { OnboardingAutomationController } from './onboarding-automation.controller';
import { OnboardingAutomationDispatcher } from './onboarding-automation.dispatcher';
import { OnboardingAutomationResolver } from './onboarding-automation.resolver';
import { OnboardingAutomationService } from './onboarding-automation.service';
import {
  EMPLOYEE_ONBOARDING_STAGE_REPOSITORY,
  ONBOARDING_AUTOMATION_RUN_REPOSITORY,
  ONBOARDING_AUTOMATION_SETTINGS_REPOSITORY,
} from './onboarding-automation.tokens';

// Onboarding automation: the HRMS side of the n8n onboarding workflow that used
// to hang off a Notion button. Owns its three tables; reads employee, profile,
// salary and workspace facts only through those modules' published services.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      EmployeeOnboardingStage,
      OnboardingAutomationRun,
      OnboardingAutomationSettings,
    ]),
    AuthModule,
    AuthzModule,
    EmployeeModule,
    CompensationModule,
    OrganizationModule,
  ],
  controllers: [OnboardingAutomationController],
  providers: [
    OnboardingAutomationService,
    OnboardingAutomationResolver,
    OnboardingAutomationDispatcher,
    OnboardingAutomationRequestedConsumer,
    provideTenantScopedRepository(EMPLOYEE_ONBOARDING_STAGE_REPOSITORY, EmployeeOnboardingStage),
    provideTenantScopedRepository(ONBOARDING_AUTOMATION_RUN_REPOSITORY, OnboardingAutomationRun),
    provideTenantScopedRepository(
      ONBOARDING_AUTOMATION_SETTINGS_REPOSITORY,
      OnboardingAutomationSettings,
    ),
  ],
  exports: [OnboardingAutomationService],
})
export class OnboardingAutomationModule {}
