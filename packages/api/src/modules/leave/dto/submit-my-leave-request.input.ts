import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

@InputType()
export class SubmitMyLeaveRequestInput {
  @Field(() => ID)
  @IsString()
  leaveTypeId!: string;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'startDate must be an ISO date (YYYY-MM-DD)' })
  startDate!: string;

  @Field()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'endDate must be an ISO date (YYYY-MM-DD)' })
  endDate!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string | null;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  holidayCalendarId?: string | null;
}
