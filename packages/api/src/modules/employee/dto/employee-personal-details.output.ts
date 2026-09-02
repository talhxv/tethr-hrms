import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeePersonalDetails')
export class EmployeePersonalDetailsView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => String, { nullable: true })
  passportNumber!: string | null;

  @Field(() => String, { nullable: true })
  passportIssueDate!: string | null;

  @Field(() => String, { nullable: true })
  passportIssuePlace!: string | null;

  @Field(() => String, { nullable: true })
  passportValidUpto!: string | null;

  @Field(() => String, { nullable: true })
  maritalStatus!: string | null;

  @Field(() => String, { nullable: true })
  bloodGroup!: string | null;

  @Field(() => String, { nullable: true })
  familyBackground!: string | null;

  @Field(() => String, { nullable: true })
  healthDetails!: string | null;

  @Field(() => String, { nullable: true })
  bio!: string | null;
}
