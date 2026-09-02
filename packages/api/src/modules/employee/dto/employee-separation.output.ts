import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeSeparation')
export class EmployeeSeparationView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  type!: string;

  @Field(() => String, { nullable: true })
  resignationLetterDate!: string | null;

  @Field(() => String, { nullable: true })
  relievingDate!: string | null;

  @Field(() => String, { nullable: true })
  reasonForLeaving!: string | null;

  @Field()
  leaveEncashed!: boolean;

  @Field(() => String, { nullable: true })
  encashmentDate!: string | null;

  @Field(() => String, { nullable: true })
  heldOn!: string | null;

  @Field(() => String, { nullable: true })
  newWorkplace!: string | null;

  @Field(() => String, { nullable: true })
  feedback!: string | null;

  @Field(() => ID, { nullable: true })
  initiatedByUserId!: string | null;
}
