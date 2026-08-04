import { Field, ID, ObjectType } from '@nestjs/graphql';

import { CurrentUserView } from '../../../core/auth/dto/current-user.output';

@ObjectType('ClientWorkspace')
export class ClientWorkspaceView {
  @Field(() => ID)
  id!: string;

  @Field()
  legalName!: string;

  @Field()
  displayName!: string;

  @Field()
  kind!: string;

  @Field()
  defaultLocale!: string;

  @Field()
  defaultCurrency!: string;

  @Field()
  createdAt!: string;
}

@ObjectType('OnboardClientPayload')
export class OnboardClientPayload {
  @Field(() => ClientWorkspaceView)
  client!: ClientWorkspaceView;

  @Field(() => CurrentUserView)
  initialAdmin!: CurrentUserView;
}
