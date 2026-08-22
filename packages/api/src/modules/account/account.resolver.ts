import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthPayload } from '../../core/auth/dto/auth-payload.output';
import { toCurrentUserView } from '../../core/auth/dto/current-user.output';
import { LoginInput } from '../../core/auth/dto/login.input';
import { AuthorizationService } from '../../core/authz/authz.service';
import { PERMISSIONS } from '../../core/authz/permissions';
import { PermissionsGuard } from '../../core/authz/permissions.guard';
import { RequirePermissions } from '../../core/authz/require-permissions.decorator';
import type { Organization } from '../organization/entities/organization.entity';

import { AccountService } from './account.service';
import { ClientWorkspaceView, OnboardClientPayload } from './dto/client-workspace.output';
import { LoginResult } from './dto/login-result.output';
import { OnboardClientInput } from './dto/onboard-client.input';
import { SignUpInput } from './dto/sign-up.input';

const toClientWorkspaceView = (organization: Organization): ClientWorkspaceView => ({
  id: organization.id,
  legalName: organization.legalName,
  displayName: organization.displayName,
  kind: organization.kind,
  defaultLocale: organization.defaultLocale,
  defaultCurrency: organization.defaultCurrency,
  brandColor: organization.brandColor,
  createdAt: organization.createdAt.toISOString(),
});

@Resolver()
export class AccountResolver {
  constructor(
    private readonly accountService: AccountService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Mutation(() => AuthPayload)
  async signUp(@Args('input') input: SignUpInput): Promise<AuthPayload> {
    const { user, token } = await this.accountService.signUp({
      organizationName: input.organizationName,
      email: input.email,
      password: input.password,
    });
    const access = await this.authorization.getAccessForUserInOrganization(
      user.id,
      user.organizationId,
    );
    return { token, user: toCurrentUserView(user, access) };
  }

  // Lives here (not core/auth) because a multi-workspace match needs each
  // candidate organization's display name for the picker — an Organization
  // (modules) read that core is not allowed to depend on.
  @Mutation(() => LoginResult)
  async login(@Args('input') input: LoginInput): Promise<LoginResult> {
    const outcome = await this.accountService.login(input.email, input.password);
    if (outcome.kind === 'authenticated') {
      return {
        token: outcome.token,
        user: toCurrentUserView(outcome.user, outcome.access),
        workspaceSelectionToken: null,
        workspaces: null,
      };
    }
    return {
      token: null,
      user: null,
      workspaceSelectionToken: outcome.selectionToken,
      workspaces: outcome.workspaces.map((workspace) => ({ ...workspace })),
    };
  }

  // Public precheck, same trust boundary as signUp/login: warns "a workspace
  // with this name already exists" without blocking — legalName isn't (and
  // shouldn't be) a unique key, so this only ever informs.
  @Query(() => Boolean)
  legalNameIsAlreadyUsed(@Args('legalName') legalName: string): Promise<boolean> {
    return this.accountService.legalNameIsAlreadyUsed(legalName);
  }

  @Query(() => [ClientWorkspaceView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.clientManage)
  async clientWorkspaces(): Promise<ClientWorkspaceView[]> {
    return (await this.accountService.listClientWorkspaces()).map(toClientWorkspaceView);
  }

  @Mutation(() => OnboardClientPayload)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.clientManage)
  async onboardClient(@Args('input') input: OnboardClientInput): Promise<OnboardClientPayload> {
    const { client, initialAdmin, initialHrAdmin } = await this.accountService.onboardClient({
      legalName: input.legalName,
      displayName: input.displayName ?? null,
      defaultLocale: input.defaultLocale ?? null,
      defaultCurrency: input.defaultCurrency ?? null,
      adminEmail: input.adminEmail,
      adminPassword: input.adminPassword,
      hrAdminEmail: input.hrAdminEmail,
      hrAdminPassword: input.hrAdminPassword,
    });
    const [adminAccess, hrAdminAccess] = await Promise.all([
      this.authorization.getAccessForUserInOrganization(initialAdmin.id, initialAdmin.organizationId),
      this.authorization.getAccessForUserInOrganization(
        initialHrAdmin.id,
        initialHrAdmin.organizationId,
      ),
    ]);
    return {
      client: toClientWorkspaceView(client),
      initialAdmin: toCurrentUserView(initialAdmin, adminAccess),
      initialHrAdmin: toCurrentUserView(initialHrAdmin, hrAdminAccess),
    };
  }
}
