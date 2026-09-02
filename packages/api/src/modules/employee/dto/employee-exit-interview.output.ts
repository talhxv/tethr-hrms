import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeExitInterview')
export class EmployeeExitInterviewView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID)
  separationId!: string;

  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  scheduledDate!: string | null;

  @Field(() => [ID], { nullable: true })
  interviewerUserIds!: string[] | null;

  @Field(() => String, { nullable: true })
  summary!: string | null;

  @Field(() => String, { nullable: true })
  finalDecision!: string | null;
}
