import { Field, ObjectType } from '@nestjs/graphql';

import { CurrentUserView } from './current-user.output';

// Returned by login and signup: a bearer token plus the authenticated user.
@ObjectType('AuthPayload')
export class AuthPayload {
  @Field()
  token!: string;

  @Field(() => CurrentUserView)
  user!: CurrentUserView;
}
