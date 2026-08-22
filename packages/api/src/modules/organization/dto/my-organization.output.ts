import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('MyOrganization')
export class MyOrganizationView {
  @Field(() => ID)
  id!: string;

  @Field()
  legalName!: string;

  @Field()
  displayName!: string;

  @Field()
  brandColor!: string;
}
