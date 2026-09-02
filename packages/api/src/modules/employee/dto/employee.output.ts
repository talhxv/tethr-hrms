import { Field, ID, ObjectType } from '@nestjs/graphql';

// The GraphQL boundary type — deliberately separate from the Employee entity
// (architecture.md §2.3: the resolver returns a DTO, never the ORM entity). Status
// unions surface as String here; the input validates them on the way in.
@ObjectType('Employee')
export class EmployeeType {
  @Field(() => ID)
  id!: string;

  @Field()
  employeeNumber!: string;

  @Field()
  firstName!: string;

  @Field(() => String, { nullable: true })
  middleName!: string | null;

  @Field()
  lastName!: string;

  @Field(() => String, { nullable: true })
  salutation!: string | null;

  @Field(() => String, { nullable: true })
  workEmail!: string | null;

  @Field(() => String, { nullable: true })
  roleTitle!: string | null;

  @Field(() => String, { nullable: true })
  dateOfBirth!: string | null;

  @Field(() => String, { nullable: true })
  probationEndDate!: string | null;

  @Field()
  hireDate!: string;

  @Field(() => String, { nullable: true })
  scheduledConfirmationDate!: string | null;

  @Field(() => String, { nullable: true })
  finalConfirmationDate!: string | null;

  @Field(() => String, { nullable: true })
  contractEndDate!: string | null;

  @Field(() => Number, { nullable: true })
  noticePeriodDays!: number | null;

  @Field(() => String, { nullable: true })
  retirementDate!: string | null;

  @Field(() => ID, { nullable: true })
  holidayCalendarId!: string | null;

  @Field(() => String, { nullable: true })
  terminationDate!: string | null;

  @Field()
  employmentStatus!: string;

  @Field()
  workerType!: string;
}
