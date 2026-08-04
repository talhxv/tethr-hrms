import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Holiday')
export class HolidayView {
  @Field(() => ID)
  id!: string;

  @Field()
  date!: string;

  @Field()
  name!: string;
}
