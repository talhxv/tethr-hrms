import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

@InputType()
export class UpsertExitInterviewInput {
  @Field(() => ID)
  @IsString()
  employeeId!: string;

  @Field(() => ID)
  @IsString()
  separationId!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['pending', 'scheduled', 'completed', 'cancelled'])
  status?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'scheduledDate must be an ISO date' })
  scheduledDate?: string;

  @Field(() => [ID], { nullable: true })
  @IsOptional()
  interviewerUserIds?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  summary?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsIn(['retained', 'exitConfirmed'])
  finalDecision?: string;
}
