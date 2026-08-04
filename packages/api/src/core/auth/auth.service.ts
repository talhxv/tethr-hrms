import type { EmployeeId, UserId } from '@hrms/shared';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type FindOptionsWhere } from 'typeorm';

import { NotFoundError, UnauthenticatedError } from '../../common/errors';
import { TenantContextService } from '../tenancy/tenant-context.service';
import { TenantScopedRepository } from '../tenancy/tenant-scoped.repository';

import { USER_REPOSITORY } from './auth.tokens';
import type { JwtClaims } from './jwt-claims';
import { PasswordService } from './password.service';
import { User } from './user.entity';

export type CreateUserData = {
  readonly email: string;
  readonly password: string;
  readonly employeeId?: EmployeeId | null;
};

export type AuthResult = { readonly user: User; readonly token: string };

// Authentication boundary (User ≠ Employee, non-negotiable #6). Issues stateless
// JWTs; the middleware turns a token back into tenant + principal context.
@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: TenantScopedRepository<User>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly passwords: PasswordService,
    private readonly jwtService: JwtService,
    private readonly tenantContext: TenantContextService,
  ) {}

  // Create a user in the CURRENT tenant context (the caller establishes it).
  async createUser(input: CreateUserData): Promise<User> {
    const passwordHash = await this.passwords.hash(input.password);
    const user = this.users.create({
      email: input.email.toLowerCase(),
      passwordHash,
      status: 'active',
      mfaEnabled: false,
      employeeId: input.employeeId ?? null,
    });
    return this.users.save(user);
  }

  listUsers(): Promise<User[]> {
    return this.users.find({ order: { email: 'ASC' } });
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.users.findById(id);
    if (!user) {
      throw new NotFoundError('User not found', { id });
    }
    return user;
  }

  async updateUserEmployeeLink(userId: UserId, employeeId: EmployeeId | null): Promise<User> {
    const user = await this.getUserById(userId);
    user.employeeId = employeeId;
    return this.users.save(user);
  }

  // Login lookup is intentionally NOT tenant-scoped: at login no tenant is known
  // yet. This is the one legitimate cross-tenant read (the auth boundary). The
  // issued token then pins the tenant for every later request.
  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() } as FindOptionsWhere<User>,
    });
    if (!user || user.status === 'disabled') {
      throw new UnauthenticatedError('Invalid email or password');
    }
    const valid = await this.passwords.verify(password, user.passwordHash);
    if (!valid) {
      throw new UnauthenticatedError('Invalid email or password');
    }
    return { user, token: this.issueToken(user) };
  }

  issueToken(user: User): string {
    const claims: JwtClaims = { sub: user.id, org: user.organizationId, email: user.email };
    return this.jwtService.sign(claims);
  }

  // The authenticated user, from the principal the middleware set from the JWT.
  async getCurrentUser(): Promise<User> {
    const userId = this.tenantContext.getUserId();
    if (!userId) {
      throw new UnauthenticatedError();
    }
    const user = await this.users.findById(userId);
    if (!user) {
      throw new UnauthenticatedError();
    }
    return user;
  }

  // Disable any login linked to an employee. Naturally idempotent (re-running is
  // harmless), which makes it safe as an event-driven side effect (plan.md §5.2).
  async disableUsersForEmployee(employeeId: EmployeeId): Promise<number> {
    const users = await this.users.find({ where: { employeeId } as FindOptionsWhere<User> });
    let disabledCount = 0;
    for (const user of users) {
      if (user.status !== 'disabled') {
        user.status = 'disabled';
        await this.users.save(user);
        disabledCount += 1;
      }
    }
    return disabledCount;
  }
}
