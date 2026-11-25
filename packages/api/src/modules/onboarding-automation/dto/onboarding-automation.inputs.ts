import { ONBOARDING_AUTOMATION_STAGES } from '@hrms/shared';
import { Field, ID, InputType } from '@nestjs/graphql';
import { IsBoolean, IsIn, IsOptional, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class SetEmployeeOnboardingStageInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @IsIn([...ONBOARDING_AUTOMATION_STAGES])
  stage!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  @MaxLength(2000)
  documentsFolderUrl?: string | null;
}

@InputType()
export class UpdateOnboardingAutomationSettingsInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  webhookUrl?: string | null;

  @Field()
  @IsBoolean()
  enabled!: boolean;
}
