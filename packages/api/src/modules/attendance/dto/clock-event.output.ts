import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('ClockEvent')
export class ClockEventView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  employeeId!: string;

  @Field()
  type!: string;

  @Field()
  occurredAt!: string;

  @Field()
  source!: string;
}
