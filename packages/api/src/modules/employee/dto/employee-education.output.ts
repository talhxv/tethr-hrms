import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeEducation')
export class EmployeeEducationView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  schoolOrUniversity!: string;

  @Field()
  qualification!: string;

  @Field()
  level!: string;

  @Field(() => Number, { nullable: true })
  yearOfPassing!: number | null;

  @Field(() => String, { nullable: true })
  classOrPercentage!: string | null;

  @Field(() => String, { nullable: true })
  majorSubjects!: string | null;
}
