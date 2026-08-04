import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

@InputType()
export class SubmitLeaveRequestInput {
  @Field(() => ID)
  @IsUUID()
  employeeId!: string;

  @Field(() => ID)
  @IsUUID()
  leaveTypeId!: string;

  @Field()
  @Matches(ISO_DATE, { message: 'startDate must be an ISO date (YYYY-MM-DD)' })
  startDate!: string;

  @Field()
  @Matches(ISO_DATE, { message: 'endDate must be an ISO date (YYYY-MM-DD)' })
  endDate!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  holidayCalendarId?: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  requestedByUserId?: string;
}
