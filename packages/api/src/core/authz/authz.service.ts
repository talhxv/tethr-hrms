import {
  toId,
  type OrganizationId,
  type PortalKind,
  type RoleId,
  type SystemRoleKey,
  type UserId,
} from '@hrms/shared';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { ForbiddenError, UnauthenticatedError } from '../../common/errors';
import { TenantContextService } from '../tenancy/tenant-context.service';

import { type Permission } from './permissions';
import { Role } from './role.entity';
import { portalForRoleKeys, SYSTEM_ROLES } from './system-roles';
import { UserRoleAssignment } from './user-role-assignment.entity';

export type EffectiveAccess = {
  readonly roleKeys: readonly string[];
  readonly permissions: readonly Permission[];
  readonly portal: PortalKind;
};

// Resolves role assignments into the effective access used by both GraphQL
// guards and the frontend portal selector. Reads are explicitly organization
// scoped because this is the core authorization ownership boundary.
@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Role) private readonly roles: Repository<Role>,
    @InjectRepository(UserRoleAssignment)
    private readonly assignments: Repository<UserRoleAssignment>,
    private readonly tenantContext: TenantContextService,
  ) {}

  async getCurrentAccess(): Promise<EffectiveAccess> {
    const userId = this.tenantContext.getUserId();
    if (!userId) {
      throw new UnauthenticatedError();
    }
    return this.getAccessForUserInOrganization(userId, this.tenantContext.getOrganizationId());
  }

  async getAccessForUserInOrganization(
    userId: UserId | string,
    organizationId: OrganizationId | string,
  ): Promise<EffectiveAccess> {
    const scopedUserId = toId<UserId>(userId);
    const scopedOrganizationId = toId<OrganizationId>(organizationId);
    const assignments = await this.assignments.find({
      where: { userId: scopedUserId, organizationId: scopedOrganizationId },
    });
    if (assignments.length === 0) {
      return { roleKeys: [], permissions: [], portal: 'none' };
    }

    const roles = await this.roles.find({
      where: {
        organizationId: scopedOrganizationId,
        id: In(assignments.map((assignment) => assignment.roleId)),
      },
    });
    const roleKeys = roles.flatMap((role) => (role.key ? [role.key] : []));
    const permissions = [...new Set(roles.flatMap((role) => role.permissions))] as Permission[];
    return { roleKeys, permissions, portal: portalForRoleKeys(roleKeys) };
  }

  async assignSystemRole(userId: UserId, roleKey: SystemRoleKey): Promise<void> {
    const organizationId = this.tenantContext.getOrganizationId();
    const role = await this.ensureSystemRole(organizationId, roleKey);
    const existing = await this.assignments.findOne({
      where: { organizationId, userId, roleId: toId<RoleId>(role.id) },
    });
    if (existing) return;

    await this.assignments.save(
      this.assignments.create({ organizationId, userId, roleId: toId<RoleId>(role.id) }),
    );
  }

  async replaceSystemRole(userId: UserId, roleKey: SystemRoleKey): Promise<void> {
    const organizationId = this.tenantContext.getOrganizationId();
    const role = await this.ensureSystemRole(organizationId, roleKey);
    const systemRoles = await this.roles.find({
      where: { organizationId, key: In(Object.keys(SYSTEM_ROLES)) },
    });
    const systemRoleIds = systemRoles.map((systemRole) => toId<RoleId>(systemRole.id));
    if (systemRoleIds.length > 0) {
      await this.assignments.delete({
        organizationId,
        userId,
        roleId: In(systemRoleIds),
      });
    }
    await this.assignments.save(
      this.assignments.create({ organizationId, userId, roleId: toId<RoleId>(role.id) }),
    );
  }

  async assertCurrentUserCanAssign(roleKey: SystemRoleKey): Promise<void> {
    if ((await this.listAssignableSystemRoleKeys()).includes(roleKey)) return;
    throw new ForbiddenError('Your role cannot assign that workspace role');
  }

  async listAssignableSystemRoleKeys(): Promise<readonly SystemRoleKey[]> {
    const access = await this.getCurrentAccess();
    if (access.roleKeys.includes('tethrAdmin')) {
      return Object.keys(SYSTEM_ROLES) as SystemRoleKey[];
    }
    if (access.roleKeys.includes('clientAdmin')) {
      return ['clientMember', 'employee'];
    }
    return [];
  }

  private async ensureSystemRole(
    organizationId: OrganizationId,
    roleKey: SystemRoleKey,
  ): Promise<Role> {
    const existing = await this.roles.findOne({ where: { organizationId, key: roleKey } });
    if (existing) return existing;

    const definition = SYSTEM_ROLES[roleKey];
    return this.roles.save(
      this.roles.create({
        organizationId,
        key: definition.key,
        name: definition.name,
        permissions: [...definition.permissions],
        dataScope: definition.dataScope,
      }),
    );
  }
}
