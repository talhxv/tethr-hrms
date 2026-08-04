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
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
} as Organization;

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

const buildService = () => {
  const organizationService = {
    create: jest.fn().mockResolvedValue(organization),
    listClients: jest.fn().mockResolvedValue([organization]),
  } as unknown as OrganizationService;
  const authService = {
    createUser: jest.fn().mockResolvedValue(adminUser),
    issueToken: jest.fn().mockReturnValue('token'),
  } as unknown as AuthService;
  const authorization = {
    assignSystemRole: jest.fn().mockResolvedValue(undefined),
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
  it('onboards a client workspace and seeds the first client admin inside that tenant', async () => {
    const { service, organizationService, authService, authorization, tenantContext } =
      buildService();

    const result = await service.onboardClient({
      legalName: 'Acme LLC',
      displayName: 'Acme',
      defaultLocale: 'en',
      defaultCurrency: 'USD',
      adminEmail: 'admin@acme.test',
      adminPassword: 'password123',
    });

    expect(result.client.id).toBe(ORGANIZATION);
    expect(organizationService.create).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'client', legalName: 'Acme LLC' }),
    );
    expect(tenantContext.run).toHaveBeenCalledWith(
      { organizationId: ORGANIZATION, userId: null },
      expect.any(Function),
    );
    expect(authService.createUser).toHaveBeenCalledWith({
      email: 'admin@acme.test',
      password: 'password123',
    });
    expect(authorization.assignSystemRole).toHaveBeenCalledWith(USER, 'clientAdmin');
  });
});
