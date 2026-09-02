import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNumber, IsOptional, IsString, Matches, Max, Min } from 'class-validator';

@InputType()
export class UpsertLeaveEntitlementInput {
  @Field(() => ID)
  @IsString()
  employeeId!: string;

  @Field(() => ID)
  @IsString()
  leaveTypeId!: string;

  @Field()
  @IsNumber()
  @Min(0)
  @Max(365)
  annualEntitlement!: number;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'validFrom must be an ISO date' })
  validFrom!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'validTo must be an ISO date' })
  validTo?: string;
}
