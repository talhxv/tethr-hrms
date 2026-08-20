import { Field, ID, ObjectType } from '@nestjs/graphql';

import { CurrentUserView } from '../../../core/auth/dto/current-user.output';

@ObjectType('WorkspaceOption')
export class WorkspaceOption {
  @Field(() => ID)
  organizationId!: string;

  @Field()
  organizationName!: string;
}

// Either `token`/`user` are set (the email matched exactly one workspace, or
// only one password verified) or `workspaceSelectionToken`/`workspaces` are
// (several of the caller's accounts verified) — never both. Modeled as one
// object with nullable fields rather than a GraphQL union to keep the client
// query trivial: check `workspaceSelectionToken` and branch.
@ObjectType('LoginResult')
export class LoginResult {
  @Field(() => String, { nullable: true })
  token!: string | null;

  @Field(() => CurrentUserView, { nullable: true })
  user!: CurrentUserView | null;

  @Field(() => String, { nullable: true })
  workspaceSelectionToken!: string | null;

  @Field(() => [WorkspaceOption], { nullable: true })
  workspaces!: WorkspaceOption[] | null;
}
