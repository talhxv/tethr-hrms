import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeAssignmentView')
export class EmployeeAssignmentView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID)
  positionId!: string;

  @Field(() => String, { nullable: true })
  positionTitle!: string | null;

  @Field(() => ID, { nullable: true })
  departmentId!: string | null;

  @Field(() => String, { nullable: true })
  departmentName!: string | null;

  @Field(() => ID, { nullable: true })
  locationId!: string | null;

  @Field(() => String, { nullable: true })
  locationName!: string | null;

  @Field()
  assignmentType!: string;

  @Field()
  isPrimary!: boolean;

  @Field(() => ID, { nullable: true })
  reportsToEmployeeId!: string | null;

  @Field(() => String, { nullable: true })
  reportsToName!: string | null;

  @Field()
  validFrom!: string;

  @Field(() => String, { nullable: true })
  validTo!: string | null;
}
