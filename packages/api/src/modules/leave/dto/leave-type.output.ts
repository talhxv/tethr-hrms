import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('LeaveType')
export class LeaveTypeView {
  @Field(() => ID)
  id!: string;

  @Field()
  name!: string;

  @Field()
  code!: string;

  @Field()
  unit!: string;

  @Field()
  paid!: boolean;

  @Field()
  requiresApproval!: boolean;

  @Field(() => Float)
  defaultAnnualEntitlement!: number;
}
