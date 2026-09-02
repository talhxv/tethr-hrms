import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeWorkHistory')
export class EmployeeWorkHistoryView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  companyName!: string;

  @Field(() => String, { nullable: true })
  designation!: string | null;

  @Field(() => String, { nullable: true })
  salary!: string | null;

  @Field(() => String, { nullable: true })
  address!: string | null;

  @Field(() => String, { nullable: true })
  contact!: string | null;

  @Field(() => String, { nullable: true })
  totalExperience!: string | null;
}
