import { Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('LeaveBalance')
export class LeaveBalanceView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  leaveTypeId!: string;

  @Field(() => Int)
  periodYear!: number;

  @Field(() => Float)
  entitledDays!: number;

  @Field(() => Float)
  usedDays!: number;

  @Field(() => Float)
  pendingDays!: number;

  @Field(() => Float)
  availableDays!: number;
}
