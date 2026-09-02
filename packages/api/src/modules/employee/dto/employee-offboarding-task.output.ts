import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('EmployeeOffboardingTask')
export class EmployeeOffboardingTaskView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field(() => ID, { nullable: true })
  separationId!: string | null;

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

  @Field(() => ID, { nullable: true })
  completedByUserId!: string | null;

  @Field(() => String, { nullable: true })
  notes!: string | null;
}
