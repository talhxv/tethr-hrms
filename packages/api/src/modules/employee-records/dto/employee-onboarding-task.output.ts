import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeOnboardingTask')
export class EmployeeOnboardingTaskView {
  @Field(() => ID, { nullable: true })
  id!: string | null;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  taskKey!: string;

  @Field()
  title!: string;

  @Field()
  status!: string;

  @Field(() => String, { nullable: true })
  dueDate!: string | null;

  @Field(() => String, { nullable: true })
  completedAt!: string | null;

  @Field(() => String, { nullable: true })
  notes!: string | null;
}
