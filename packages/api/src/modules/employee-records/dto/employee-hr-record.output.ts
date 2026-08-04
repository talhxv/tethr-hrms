import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeHrRecord')
export class EmployeeHrRecordView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => String, { nullable: true })
  roleTitle!: string | null;

  @Field(() => String, { nullable: true })
  salaryBreakdown!: string | null;

  @Field(() => String, { nullable: true })
  bankName!: string | null;

  @Field(() => String, { nullable: true })
  bankAccountTitle!: string | null;

  @Field(() => String, { nullable: true })
  bankAccountNumber!: string | null;

  @Field(() => String, { nullable: true })
  bankIban!: string | null;

  @Field(() => String, { nullable: true })
  hardwareInfo!: string | null;

  @Field(() => String, { nullable: true })
  employeeRecordForm!: string | null;
}
