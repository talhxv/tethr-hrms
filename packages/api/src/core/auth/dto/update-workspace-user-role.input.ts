import { Field, ID, InputType } from '@nestjs/graphql';
import { IsIn, IsOptional, IsUUID } from 'class-validator';

import { SYSTEM_ROLES } from '../../authz/system-roles';

const SYSTEM_ROLE_KEYS = Object.keys(SYSTEM_ROLES);

@InputType()
export class UpdateWorkspaceUserRoleInput {
  @Field(() => ID)
  @IsUUID()
  userId!: string;

  @Field()
  // Every system role, read from the role definitions so a new role (e.g.
  // tethrFinance, missing from a hand-kept list until 16 Nov 2026) cannot be
  // offered by the UI yet rejected here. Who may assign which role is checked
  // separately (AuthorizationService.assertCurrentUserCanAssign).
  @IsIn(SYSTEM_ROLE_KEYS)
  roleKey!: string;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsUUID()
  employeeId?: string | null;
}
