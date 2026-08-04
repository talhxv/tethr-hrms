import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

import { HiringRequestUpdateView } from './hiring-request-update.output';

@ObjectType('HiringRequest')
export class HiringRequestView {
  @Field(() => ID)
  id!: string;

  @Field()
  positionTitle!: string;

  @Field(() => Int)
  headcount!: number;

  @Field()
  employmentType!: string;

  @Field(() => String, { nullable: true })
  location!: string | null;

  @Field(() => String, { nullable: true })
  preferredStartDate!: string | null;

  @Field(() => String, { nullable: true })
  clientNote!: string | null;

  @Field(() => String, { nullable: true })
  tethrNote!: string | null;

  @Field()
  status!: string;

  @Field()
  createdAt!: string;

  @Field()
  updatedAt!: string;

  @Field(() => [HiringRequestUpdateView])
  updates!: HiringRequestUpdateView[];
}
