import type { JwtService } from '@nestjs/jwt';
import type { Repository } from 'typeorm';

import type { TenantContextService } from '../tenancy/tenant-context.service';
import type { TenantScopedRepository } from '../tenancy/tenant-scoped.repository';

import { AuthService, MIN_OWN_PASSWORD_LENGTH } from './auth.service';
import { PasswordService } from './password.service';
import type { User } from './user.entity';

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    organizationId: 'org-1',
    email: 'alex.morgan@example.com',
    passwordHash: '',
    status: 'active',
    mfaEnabled: false,
    isWorkspaceCreator: false,
    mustChangePassword: false,
    employeeId: null,
    ...overrides,
  }) as User;

const setup = async (user: User) => {
  const passwords = new PasswordService();
  user.passwordHash = await passwords.hash('issued-password-1');
  const users = {
    findById: jest.fn(async (id: string) => (id === user.id ? user : null)),
    save: jest.fn(async (saved: User) => saved),
  } as unknown as TenantScopedRepository<User>;
  const tenantContext = { getUserId: () => user.id } as unknown as TenantContextService;
  const service = new AuthService(
    users,
    {} as Repository<User>,
    passwords,
    {} as JwtService,
    tenantContext,
  );
  return { service, passwords };
};

describe('AuthService password recovery', () => {
  it('issues a one-time password that works and forces a change', async () => {
    const user = makeUser();
    const { service, passwords } = await setup(user);
    const { user: saved, temporaryPassword } = await service.issueTemporaryPassword(user.id);
    expect(temporaryPassword.length).toBeGreaterThanOrEqual(20);
    expect(saved.mustChangePassword).toBe(true);
    expect(await passwords.verify(temporaryPassword, saved.passwordHash)).toBe(true);
    expect(await passwords.verify('issued-password-1', saved.passwordHash)).toBe(false);
  });

  it('refuses to reset a disabled login', async () => {
    const user = makeUser({ status: 'disabled' });
    const { service } = await setup(user);
    await expect(service.issueTemporaryPassword(user.id)).rejects.toThrow(/disabled/);
  });

  it('changes the own password and clears the forced-change flag', async () => {
    const user = makeUser({ mustChangePassword: true });
    const { service, passwords } = await setup(user);
    const saved = await service.changeOwnPassword('issued-password-1', 'a-new-long-password');
    expect(saved.mustChangePassword).toBe(false);
    expect(await passwords.verify('a-new-long-password', saved.passwordHash)).toBe(true);
  });

  it('rejects a wrong current password, a short one, and an unchanged one', async () => {
    const user = makeUser({ mustChangePassword: true });
    const { service } = await setup(user);
    await expect(service.changeOwnPassword('wrong', 'a-new-long-password')).rejects.toThrow(/not correct/);
    await expect(
      service.changeOwnPassword('issued-password-1', 'x'.repeat(MIN_OWN_PASSWORD_LENGTH - 1)),
    ).rejects.toThrow(/at least/);
    await expect(service.changeOwnPassword('issued-password-1', 'issued-password-1')).rejects.toThrow(/different/);
    expect(user.mustChangePassword).toBe(true);
  });
});
