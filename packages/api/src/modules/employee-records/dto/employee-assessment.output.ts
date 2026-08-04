import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeAssessment')
export class EmployeeAssessmentView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  title!: string;

  @Field()
  assessmentDate!: string;

  @Field(() => Int, { nullable: true })
  score!: number | null;

  @Field(() => String, { nullable: true })
  assessorName!: string | null;

  @Field(() => String, { nullable: true })
  notes!: string | null;
}
