import { Field, ID, InputType } from '@nestjs/graphql';
import { IsUUID, Matches } from 'class-validator';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

@InputType()
export class OpenTimesheetInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field()
  @Matches(ISO_DATE, { message: 'periodStart must be an ISO date (YYYY-MM-DD)' })
  periodStart!: string;

  @Field()
  @Matches(ISO_DATE, { message: 'periodEnd must be an ISO date (YYYY-MM-DD)' })
  periodEnd!: string;
}
