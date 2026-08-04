import { Field, ID, InputType } from '@nestjs/graphql';
import { IsString, Matches } from 'class-validator';

@InputType()
export class TerminateEmployeeInput {
  @Field(() => ID)
  @IsString()
  employeeId!: string;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'effectiveDate must be an ISO date (YYYY-MM-DD)' })
  effectiveDate!: string;

  @Field()
  @IsString()
  reason!: string;
}
