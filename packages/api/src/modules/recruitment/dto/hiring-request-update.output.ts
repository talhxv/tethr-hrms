import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('HiringRequestUpdate')
export class HiringRequestUpdateView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  hiringRequestId!: string;

  @Field()
  status!: string;

  @Field()
  actor!: string;

  @Field(() => String, { nullable: true })
  note!: string | null;

  @Field(() => ID)
  createdByUserId!: string;

  @Field()
  createdAt!: string;
}
