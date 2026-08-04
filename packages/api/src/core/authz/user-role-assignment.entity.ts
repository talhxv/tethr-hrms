import type { RoleId, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../database/entities/tenant-scoped.entity';

// A user's access is scoped to an organization, independently of the user's
// optional employee record. There are no cross-module foreign keys here: this
// core authorization module owns both the role reference and its assignment.
@Entity('user_role_assignments')
@Index(['organizationId', 'userId', 'roleId'], { unique: true })
export class UserRoleAssignment extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  userId!: UserId;

  @Column({ type: 'uuid' })
  roleId!: RoleId;
}
