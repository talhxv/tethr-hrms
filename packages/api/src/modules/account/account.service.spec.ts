import { toId, type OrganizationId, type UserId } from '@hrms/shared';

import type { AuthService } from '../../core/auth/auth.service';
import type { User } from '../../core/auth/user.entity';
import type { AuthorizationService } from '../../core/authz/authz.service';
import type { TenantContextService } from '../../core/tenancy/tenant-context.service';
import type { Organization } from '../organization/entities/organization.entity';
import type { OrganizationService } from '../organization/organization.service';

import { AccountService } from './account.service';

const ORGANIZATION = toId<OrganizationId>('organization-1');
const USER = toId<UserId>('user-1');

const organization = {
  id: ORGANIZATION,
  kind: 'client',
  legalName: 'Acme LLC',
  displayName: 'Acme',
  defaultLocale: 'en',
  defaultCurrency: 'USD',
  settings: {},
  brandColor: 'iris',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as Organization;

const HR_ADMIN_USER = toId<UserId>('user-2');

const adminUser = {
  id: USER,
  organizationId: ORGANIZATION,
  email: 'admin@acme.test',
  passwordHash: 'hash',
  status: 'active',
  mfaEnabled: false,
  employeeId: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as User;

const hrAdminUser = {
  ...adminUser,
  id: HR_ADMIN_USER,
  email: 'hr@tethrhq.test',
} as User;

const buildService = () => {
  const organizationService = {
    create: jest.fn().mockResolvedValue(organization),
    listClients: jest.fn().mockResolvedValue([organization]),
    getById: jest.fn().mockResolvedValue(organization),
  } as unknown as OrganizationService;
  const authService = {
    createUser: jest.fn().mockResolvedValueOnce(adminUser).mockResolvedValueOnce(hrAdminUser),
    findVerifiedUsers: jest.fn(),
    issueToken: jest.fn().mockReturnValue('token'),
    issueWorkspaceSelectionToken: jest.fn().mockReturnValue('selection-token'),
  } as unknown as AuthService;
  const authorization = {
    assignSystemRole: jest.fn().mockResolvedValue(undefined),
    getAccessForUserInOrganization: jest
      .fn()
      .mockResolvedValue({ roleKeys: [], permissions: [], portal: 'none' }),
  } as unknown as AuthorizationService;
  const tenantContext = {
    run: jest.fn((_context: unknown, callback: () => unknown) => callback()),
  } as unknown as TenantContextService;

  return {
    service: new AccountService(organizationService, authService, authorization, tenantContext),
    organizationService,
    authService,
    authorization,
    tenantContext,
  };
};

describe('AccountService', () => {
  it('onboards a client workspace and seeds a client admin plus a tethrAdmin inside that tenant', async () => {
    const { service, organizationService, authService, authorization, tenantContext } =
      buildService();

    const result = await service.onboardClient({
      legalName: 'Acme LLC',
      displayName: 'Acme',
      defaultLocale: 'en',
      defaultCurrency: 'USD',
      adminEmail: 'admin@acme.test',
      adminPassword: 'password123',
      hrAdminEmail: 'hr@tethrhq.test',
      hrAdminPassword: 'password456',
    });

    expect(result.client.id).toBe(ORGANIZATION);
    expect(result.initialHrAdmin.id).toBe(HR_ADMIN_USER);
    expect(organizationService.create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'client', legalName: 'Acme LLC' }),
    );
    expect(tenantContext.run).toHaveBeenCalledWith(
      { organizationId: ORGANIZATION, userId: null },
      expect.any(Function),
    );
    expect(authService.createUser).toHaveBeenNthCalledWith(1, {
      email: 'admin@acme.test',
      password: 'password123',
    });
    expect(authService.createUser).toHaveBeenNthCalledWith(2, {
      email: 'hr@tethrhq.test',
      password: 'password456',
    });
    expect(authorization.assignSystemRole).toHaveBeenCalledWith(USER, 'clientAdmin');
    expect(authorization.assignSystemRole).toHaveBeenCalledWith(HR_ADMIN_USER, 'tethrAdmin');
  });

  it('logs in directly when exactly one workspace verifies', async () => {
    const { service, authService, authorization } = buildService();
    (authService.findVerifiedUsers as jest.Mock).mockResolvedValue([adminUser]);

    const outcome = await service.login('admin@acme.test', 'password123');

    expect(outcome.kind).toBe('authenticated');
    if (outcome.kind !== 'authenticated') throw new Error('expected authenticated outcome');
    expect(outcome.token).toBe('token');
    expect(authorization.getAccessForUserInOrganization).toHaveBeenCalledWith(
      adminUser.id,
      adminUser.organizationId,
    );
  });

  it('returns a workspace selection when the same email verifies in more than one org', async () => {
    const { service, authService, organizationService } = buildService();
    (authService.findVerifiedUsers as jest.Mock).mockResolvedValue([adminUser, hrAdminUser]);

    const outcome = await service.login('shared@tethrhq.test', 'password123');

    expect(outcome.kind).toBe('selectWorkspace');
    if (outcome.kind !== 'selectWorkspace') throw new Error('expected selectWorkspace outcome');
    expect(outcome.selectionToken).toBe('selection-token');
    expect(outcome.workspaces).toEqual([
      { organizationId: ORGANIZATION, organizationName: 'Acme' },
      { organizationId: ORGANIZATION, organizationName: 'Acme' },
    ]);
    expect(organizationService.getById).toHaveBeenCalledTimes(2);
  });
});
