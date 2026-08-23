import { Field, ObjectType } from '@nestjs/graphql';

import { CurrentUserView } from '../../../core/auth/dto/current-user.output';
import { ClientView } from '../../clients/dto/client.output';
import { WorkspaceSummaryView } from '../../organization/dto/workspace-summary.output';

@ObjectType('OnboardClientPayload')
export class OnboardClientPayload {
  @Field(() => ClientView)
  client!: ClientView;

  @Field(() => WorkspaceSummaryView)
  workspace!: WorkspaceSummaryView;

  @Field(() => CurrentUserView)
  initialAdmin!: CurrentUserView;

  @Field(() => CurrentUserView)
  initialHrAdmin!: CurrentUserView;
}
