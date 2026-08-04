import { toId, type OrganizationId, type UserId } from '@hrms/shared';
import { Injectable } from '@nestjs/common';

import { AuthService, type AuthResult } from '../../core/auth/auth.service';
import { AuthorizationService } from '../../core/authz/authz.service';
import { TenantContextService } from '../../core/tenancy/tenant-context.service';
import type { Organization } from '../organization/entities/organization.entity';
import { OrganizationService } from '../organization/organization.service';

export type SignUpData = {
  readonly organizationName: string;
  readonly email: string;
  readonly password: string;
};

export type OnboardClientData = {
  readonly legalName: string;
  readonly displayName?: string | null;
  readonly defaultLocale?: string | null;
  readonly defaultCurrency?: string | null;
  readonly adminEmail: string;
  readonly adminPassword: string;
};

export type OnboardClientResult = {
  readonly client: Organization;
  readonly initialAdmin: Awaited<ReturnType<AuthService['createUser']>>;
};

// Onboards a new company: create the organization (tenant), then its first admin
// user, then issue a session token. Composes the Organization (modules) and Auth
// (core) published interfaces — it never touches their tables directly, which is
// exactly the cross-bucket pattern the architecture mandates.
@Injectable()
export class AccountService {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly authService: AuthService,
    private readonly authorization: AuthorizationService,
    private readonly tenantContext: TenantContextService,
  ) {}

  async signUp(input: SignUpData): Promise<AuthResult> {
    const organization = await this.organizationService.create({
      legalName: input.organizationName,
    });
    const organizationId = toId<OrganizationId>(organization.id);

    // Create the first admin user inside the new tenant's context.
    const user = await this.tenantContext.run({ organizationId, userId: null }, async () => {
      const created = await this.authService.createUser({
        email: input.email,
        password: input.password,
      });
      await this.authorization.assignSystemRole(toId<UserId>(created.id), 'clientAdmin');
      return created;
    });

    return { user, token: this.authService.issueToken(user) };
  }

  listClientWorkspaces(): Promise<Organization[]> {
    return this.organizationService.listClients();
  }

  async onboardClient(input: OnboardClientData): Promise<OnboardClientResult> {
    const organization = await this.organizationService.create({
      kind: 'client',
      legalName: input.legalName,
      displayName: input.displayName ?? undefined,
      defaultLocale: input.defaultLocale ?? undefined,
      defaultCurrency: input.defaultCurrency ?? undefined,
    });
    const organizationId = toId<OrganizationId>(organization.id);

    const initialAdmin = await this.tenantContext.run(
      { organizationId, userId: null },
      async () => {
        const created = await this.authService.createUser({
          email: input.adminEmail,
          password: input.adminPassword,
        });
        await this.authorization.assignSystemRole(toId<UserId>(created.id), 'clientAdmin');
        return created;
      },
    );

    return { client: organization, initialAdmin };
  }
}
