import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

import type { OnboardingAutomationRun } from '../entities/onboarding-automation-run.entity';
import type {
  EmployeeOnboardingStageRecord,
  OnboardingAutomationSettingsRecord,
} from '../onboarding-automation.service';

@ObjectType('EmployeeOnboardingStage')
export class EmployeeOnboardingStageView {
  @Field(() => ID)
  employeeId!: string;

  // One of ONBOARDING_AUTOMATION_STAGES (@hrms/shared).
  @Field()
  stage!: string;

  @Field(() => String, { nullable: true })
  documentsFolderUrl!: string | null;

  @Field(() => String, { nullable: true })
  updatedAt!: string | null;
}

@ObjectType('OnboardingAutomationRun')
export class OnboardingAutomationRunView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  stage!: string;

  // One of ONBOARDING_AUTOMATION_RUN_STATUSES (@hrms/shared).
  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  resultStage!: string | null;

  @Field(() => String, { nullable: true })
  documentUrl!: string | null;

  @Field(() => String, { nullable: true })
  message!: string | null;

  @Field(() => Int, { nullable: true })
  responseStatus!: number | null;

  @Field()
  createdAt!: string;

  @Field(() => String, { nullable: true })
  deliveredAt!: string | null;

  @Field(() => String, { nullable: true })
  completedAt!: string | null;
}

@ObjectType('OnboardingAutomationSettings')
export class OnboardingAutomationSettingsView {
  @Field(() => String, { nullable: true })
  webhookUrl!: string | null;

  @Field()
  enabled!: boolean;

  // Whether ONBOARDING_AUTOMATION_SECRET is set on the server. The secret
  // itself never leaves the server.
  @Field()
  secretConfigured!: boolean;

  // Path on the API the workflow reports back to (the web app prefixes the
  // API origin it already knows).
  @Field()
  callbackPath!: string;

  @Field()
  ready!: boolean;
}

export const toStageView = (record: EmployeeOnboardingStageRecord): EmployeeOnboardingStageView => ({
  employeeId: record.employeeId,
  stage: record.stage,
  documentsFolderUrl: record.documentsFolderUrl,
  updatedAt: record.updatedAt ? record.updatedAt.toISOString() : null,
});

export const toRunView = (run: OnboardingAutomationRun): OnboardingAutomationRunView => ({
  id: run.id,
  employeeId: run.employeeId,
  stage: run.stage,
  status: run.status,
  resultStage: run.resultStage,
  documentUrl: run.documentUrl,
  message: run.message,
  responseStatus: run.responseStatus,
  createdAt: run.createdAt.toISOString(),
  deliveredAt: run.deliveredAt ? run.deliveredAt.toISOString() : null,
  completedAt: run.completedAt ? run.completedAt.toISOString() : null,
});

export const toSettingsView = (
  record: OnboardingAutomationSettingsRecord,
): OnboardingAutomationSettingsView => ({ ...record });
