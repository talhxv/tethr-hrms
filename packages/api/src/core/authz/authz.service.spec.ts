import { toId, type OrganizationId, type RoleId, type UserId } from '@hrms/shared';
import type { Repository } from 'typeorm';

import type { TenantContextService } from '../tenancy/tenant-context.service';

import { AuthorizationService } from './authz.service';
import { PERMISSIONS } from './permissions';
import type { Role } from './role.entity';
import type { UserRoleAssignment } from './user-role-assignment.entity';

const ORGANIZATION = toId<OrganizationId>('org-1');
const USER = toId<UserId>('user-1');
const CLIENT_ROLE = toId<RoleId>('role-client');
const EMPLOYEE_ROLE = toId<RoleId>('role-employee');
const TETHR_ROLE = toId<RoleId>('role-tethr');

const role = (id: RoleId, key: string, permissions: string[]): Role => ({
  id,
  organizationId: ORGANIZATION,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  key,
  name: key,
  permissions,
  dataScope: 'organization',
});

describe('AuthorizationService', () => {
  it('unions assigned role permissions and chooses the highest-priority portal', async () => {
    const roles = {
      find: jest
        .fn()
        .mockResolvedValue([
          role(CLIENT_ROLE, 'clientAdmin', [PERMISSIONS.employeeRead]),
          role(EMPLOYEE_ROLE, 'employee', [PERMISSIONS.leaveOwnRead]),
        ]),
    } as unknown as Repository<Role>;
    const assignments = {
      find: jest.fn().mockResolvedValue([
        { userId: USER, roleId: CLIENT_ROLE },
        { userId: USER, roleId: EMPLOYEE_ROLE },
      ]),
    } as unknown as Repository<UserRoleAssignment>;
    const tenantContext = {} as TenantContextService;
    const service = new AuthorizationService(roles, assignments, tenantContext);

    const access = await service.getAccessForUserInOrganization(USER, ORGANIZATION);

    expect(access.portal).toBe('client');
    expect(access.roleKeys).toEqual(['clientAdmin', 'employee']);
    expect(access.permissions).toEqual(
      expect.arrayContaining([PERMISSIONS.employeeRead, PERMISSIONS.leaveOwnRead]),
    );
  });

  it('returns no portal and no permissions when the user has no assignment', async () => {
    const roles = { find: jest.fn() } as unknown as Repository<Role>;
    const assignments = {
      find: jest.fn().mockResolvedValue([]),
    } as unknown as Repository<UserRoleAssignment>;
    const tenantContext = {} as TenantContextService;
    const service = new AuthorizationService(roles, assignments, tenantContext);

    await expect(service.getAccessForUserInOrganization(USER, ORGANIZATION)).resolves.toEqual({
      roleKeys: [],
      permissions: [],
      portal: 'none',
    });
    expect(roles.find).not.toHaveBeenCalled();
  });

  it('replaces existing system role assignments with the selected role', async () => {
    const roles = {
      findOne: jest.fn().mockResolvedValue(role(CLIENT_ROLE, 'clientMember', [])),
      find: jest
        .fn()
        .mockResolvedValue([
          role(CLIENT_ROLE, 'clientMember', []),
          role(EMPLOYEE_ROLE, 'employee', []),
        ]),
    } as unknown as Repository<Role>;
    const assignments = {
      delete: jest.fn().mockResolvedValue(undefined),
      create: jest.fn((value: unknown) => value),
      save: jest.fn().mockResolvedValue(undefined),
    } as unknown as Repository<UserRoleAssignment>;
    const tenantContext = {
      getOrganizationId: jest.fn().mockReturnValue(ORGANIZATION),
    } as unknown as TenantContextService;
    const service = new AuthorizationService(roles, assignments, tenantContext);

    await service.replaceSystemRole(USER, 'clientMember');

    expect(assignments.delete).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: ORGANIZATION, userId: USER }),
    );
    expect(assignments.save).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: ORGANIZATION, userId: USER, roleId: CLIENT_ROLE }),
    );
  });

  it('lets Tethr Admin assign every V1 system role', async () => {
    const roles = {
      find: jest.fn().mockResolvedValue([role(TETHR_ROLE, 'tethrAdmin', [])]),
    } as unknown as Repository<Role>;
    const assignments = {
      find: jest.fn().mockResolvedValue([{ userId: USER, roleId: TETHR_ROLE }]),
    } as unknown as Repository<UserRoleAssignment>;
    const tenantContext = {
      getUserId: jest.fn().mockReturnValue(USER),
      getOrganizationId: jest.fn().mockReturnValue(ORGANIZATION),
    } as unknown as TenantContextService;
    const service = new AuthorizationService(roles, assignments, tenantContext);

    await expect(service.listAssignableSystemRoleKeys()).resolves.toEqual([
      'tethrAdmin',
      'tethrHr',
      'tethrFinance',
      'clientAdmin',
      'clientMember',
      'employee',
    ]);
    await expect(service.assertCurrentUserCanAssign('tethrHr')).resolves.toBeUndefined();
  });

  it('limits Client Admin role assignment to client member and employee access', async () => {
    const roles = {
      find: jest.fn().mockResolvedValue([role(CLIENT_ROLE, 'clientAdmin', [])]),
    } as unknown as Repository<Role>;
    const assignments = {
      find: jest.fn().mockResolvedValue([{ userId: USER, roleId: CLIENT_ROLE }]),
    } as unknown as Repository<UserRoleAssignment>;
    const tenantContext = {
      getUserId: jest.fn().mockReturnValue(USER),
      getOrganizationId: jest.fn().mockReturnValue(ORGANIZATION),
    } as unknown as TenantContextService;
    const service = new AuthorizationService(roles, assignments, tenantContext);

    await expect(service.listAssignableSystemRoleKeys()).resolves.toEqual([
      'clientMember',
      'employee',
    ]);
    await expect(service.assertCurrentUserCanAssign('employee')).resolves.toBeUndefined();
    await expect(service.assertCurrentUserCanAssign('tethrHr')).rejects.toThrow(
      'Your role cannot assign that workspace role',
    );
  });
});
