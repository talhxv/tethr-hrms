import { Field, ObjectType } from '@nestjs/graphql';

import { CurrentUserView } from './current-user.output';

// Returned once, to the administrator who issued it. Never stored in plain
// text and never retrievable again.
@ObjectType('TemporaryPasswordIssued')
export class TemporaryPasswordIssuedView {
  @Field(() => CurrentUserView)
  user!: CurrentUserView;

  @Field()
  temporaryPassword!: string;
}
