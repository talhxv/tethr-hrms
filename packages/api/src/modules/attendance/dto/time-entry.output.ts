import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('TimeEntry')
export class TimeEntryView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  date!: string;

  @Field(() => Float)
  hours!: number;

  @Field()
  source!: string;
}
