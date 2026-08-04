import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Announcement')
export class AnnouncementView {
  @Field(() => ID)
  id!: string;

  @Field()
  title!: string;

  @Field()
  body!: string;

  @Field()
  audience!: string;

  @Field()
  isPinned!: boolean;

  @Field()
  publishedAt!: string;

  @Field(() => String, { nullable: true })
  expiresAt!: string | null;
}
