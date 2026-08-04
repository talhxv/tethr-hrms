import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeFeedback')
export class EmployeeFeedbackView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  category!: string;

  @Field()
  subject!: string;

  @Field()
  body!: string;

  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  resolutionNote!: string | null;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;
}
