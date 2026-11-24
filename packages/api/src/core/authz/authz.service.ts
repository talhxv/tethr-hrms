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

// Every guarded request resolves the caller's access, which costs two database
// round trips. Each one is slow when the API and database sit in different
// regions. A short per-instance cache removes those trips from almost every
// request. Role changes made through this service clear the entry at once; a
// change made on another instance, or by an offline script, applies within the
// TTL.
const ACCESS_CACHE_TTL_MS = 30_000;
const ACCESS_CACHE_MAX_ENTRIES = 5_000;

type CachedAccess = { readonly access: EffectiveAccess; readonly expiresAt: number };

// Resolves role assignments into the effective access used by both GraphQL
// guards and the frontend portal selector. Reads are explicitly organization
// scoped because this is the core authorization ownership boundary.
@Injectable()
export class AuthorizationService {
  private readonly accessCache = new Map<string, CachedAccess>();

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
    const cacheKey = accessCacheKey(organizationId, userId);
    const cached = this.accessCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.access;
    }
    const access = await this.loadAccess(userId, organizationId);
    if (this.accessCache.size >= ACCESS_CACHE_MAX_ENTRIES) {
      this.accessCache.clear();
    }
    this.accessCache.set(cacheKey, { access, expiresAt: Date.now() + ACCESS_CACHE_TTL_MS });
    return access;
  }

  private forgetAccess(organizationId: OrganizationId | string, userId: UserId | string): void {
    this.accessCache.delete(accessCacheKey(organizationId, userId));
  }

  private async loadAccess(
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
    this.forgetAccess(organizationId, userId);
  }

  async replaceSystemRole(userId: UserId, roleKey: SystemRoleKey): Promise<void> {
    const organizationId = this.tenantContext.getOrganizationId();
    const role = await this.ensureSystemRole(organizationId, roleKey);
    const systemRoles = await this.roles.find({
      where: { organizationId, key: In(Object.keys(SYSTEM_ROLES)) },
    });
    const systemRoleIds = systemRoles.map((systemRole) => toId<RoleId>(systemRole.id));
    // Forget before and after the write: a request that lands between the delete
    // and the save must not leave a cached "no roles" behind.
    this.forgetAccess(organizationId, userId);
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
    this.forgetAccess(organizationId, userId);
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
    // Tethr HR issues and resets staff logins, but only at Employee level;
    // admin, HR and Finance logins stay with Tethr administrators.
    if (access.roleKeys.includes('tethrHr')) {
      return ['employee'];
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

const accessCacheKey = (organizationId: OrganizationId | string, userId: UserId | string): string =>
  `${organizationId}:${userId}`;
