import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeLeaveEntitlement')
export class EmployeeLeaveEntitlementView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID)
  leaveTypeId!: string;

  @Field()
  annualEntitlement!: number;

  @Field()
  validFrom!: string;

  @Field(() => String, { nullable: true })
  validTo!: string | null;
}
