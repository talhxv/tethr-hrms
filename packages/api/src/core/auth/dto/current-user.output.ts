import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { EffectiveAccess } from '../../authz/authz.service';
import { User } from '../user.entity';

@ObjectType('CurrentUser')
export class CurrentUserView {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  organizationId!: string;

  @Field()
  email!: string;

  @Field()
  status!: string;

  @Field(() => ID, { nullable: true })
  employeeId!: string | null;

  @Field(() => [String])
  roleKeys!: string[];

  @Field()
  portal!: string;
}

export const toCurrentUserView = (user: User, access: EffectiveAccess): CurrentUserView => ({
  id: user.id,
  organizationId: user.organizationId,
  email: user.email,
  status: user.status,
  employeeId: user.employeeId,
  roleKeys: [...access.roleKeys],
  portal: access.portal,
});
