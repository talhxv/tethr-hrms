import { toId, type OrganizationId, type UserId } from '@hrms/shared';
import { Injectable } from '@nestjs/common';

import { UnauthenticatedError } from '../../common/errors';
import { AuthService, type AuthResult } from '../../core/auth/auth.service';
import type { User } from '../../core/auth/user.entity';
import { AuthorizationService, type EffectiveAccess } from '../../core/authz/authz.service';
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
  readonly hrAdminEmail: string;
  readonly hrAdminPassword: string;
};

export type OnboardClientResult = {
  readonly client: Organization;
  readonly initialAdmin: Awaited<ReturnType<AuthService['createUser']>>;
  readonly initialHrAdmin: Awaited<ReturnType<AuthService['createUser']>>;
};

export type LoginOutcome =
  | { readonly kind: 'authenticated'; readonly token: string; readonly user: User; readonly access: EffectiveAccess }
  | {
      readonly kind: 'selectWorkspace';
      readonly selectionToken: string;
      readonly workspaces: readonly { readonly organizationId: string; readonly organizationName: string }[];
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

  // Tethr is fully-managed by default (design.md "we handle the rest"): every
  // client org gets its own clientAdmin (view/approve only) AND its own
  // tethrAdmin, seeded together so there is never a window where a newly
  // onboarded client has no Tethr staff able to work inside it. The
  // tethrAdmin here is a plain member of THIS org only — nothing cross-tenant
  // — so a Tethr person supporting several clients holds one such account per
  // org (findVerifiedUsers + the workspace-selection login flow is how they
  // move between them).
  async onboardClient(input: OnboardClientData): Promise<OnboardClientResult> {
    const organization = await this.organizationService.create({
      kind: 'client',
      legalName: input.legalName,
      displayName: input.displayName ?? undefined,
      defaultLocale: input.defaultLocale ?? undefined,
      defaultCurrency: input.defaultCurrency ?? undefined,
    });
    const organizationId = toId<OrganizationId>(organization.id);

    const { initialAdmin, initialHrAdmin } = await this.tenantContext.run(
      { organizationId, userId: null },
      async () => {
        const admin = await this.authService.createUser({
          email: input.adminEmail,
          password: input.adminPassword,
        });
        await this.authorization.assignSystemRole(toId<UserId>(admin.id), 'clientAdmin');

        const hrAdmin = await this.authService.createUser({
          email: input.hrAdminEmail,
          password: input.hrAdminPassword,
        });
        await this.authorization.assignSystemRole(toId<UserId>(hrAdmin.id), 'tethrAdmin');

        return { initialAdmin: admin, initialHrAdmin: hrAdmin };
      },
    );

    return { client: organization, initialAdmin, initialHrAdmin };
  }

  // Orchestrates login across the Auth (core) and Organization (modules)
  // boundaries: verifies credentials against every workspace this email
  // holds an account in, then either logs straight in (the common case) or
  // hands back a short-lived selection token plus the matched workspaces'
  // display names for a picker screen.
  async login(email: string, password: string): Promise<LoginOutcome> {
    const verifiedUsers = await this.authService.findVerifiedUsers(email, password);
    if (verifiedUsers.length === 0) {
      throw new UnauthenticatedError('Invalid email or password');
    }
    if (verifiedUsers.length === 1) {
      const [user] = verifiedUsers;
      const access = await this.authorization.getAccessForUserInOrganization(
        user.id,
        user.organizationId,
      );
      return { kind: 'authenticated', token: this.authService.issueToken(user), user, access };
    }

    const workspaces = await Promise.all(
      verifiedUsers.map(async (user) => {
        const organization = await this.organizationService.getById(
          toId<OrganizationId>(user.organizationId),
        );
        return {
          organizationId: user.organizationId,
          organizationName: organization?.displayName ?? organization?.legalName ?? user.organizationId,
        };
      }),
    );
    return {
      kind: 'selectWorkspace',
      selectionToken: this.authService.issueWorkspaceSelectionToken(
        email,
        verifiedUsers.map((user) => user.organizationId),
      ),
      workspaces,
    };
  }
}
