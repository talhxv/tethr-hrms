import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('LeaveRequest')
export class LeaveRequestView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID)
  leaveTypeId!: string;

  @Field()
  startDate!: string;

  @Field()
  endDate!: string;

  @Field(() => Float)
  dayCount!: number;

  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  reason!: string | null;

  @Field()
  submittedAt!: string;

  @Field(() => String, { nullable: true })
  decidedAt!: string | null;

  @Field(() => ID, { nullable: true })
  decidedByUserId!: string | null;

  @Field(() => String, { nullable: true })
  decisionNote!: string | null;
}
