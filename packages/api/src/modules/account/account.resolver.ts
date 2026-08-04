import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthPayload } from '../../core/auth/dto/auth-payload.output';
import { toCurrentUserView } from '../../core/auth/dto/current-user.output';
import { AuthorizationService } from '../../core/authz/authz.service';
import { PERMISSIONS } from '../../core/authz/permissions';
import { PermissionsGuard } from '../../core/authz/permissions.guard';
import { RequirePermissions } from '../../core/authz/require-permissions.decorator';
import type { Organization } from '../organization/entities/organization.entity';

import { AccountService } from './account.service';
import { ClientWorkspaceView, OnboardClientPayload } from './dto/client-workspace.output';
import { OnboardClientInput } from './dto/onboard-client.input';
import { SignUpInput } from './dto/sign-up.input';

const toClientWorkspaceView = (organization: Organization): ClientWorkspaceView => ({
  id: organization.id,
  legalName: organization.legalName,
  displayName: organization.displayName,
  kind: organization.kind,
  defaultLocale: organization.defaultLocale,
  defaultCurrency: organization.defaultCurrency,
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
    const { client, initialAdmin } = await this.accountService.onboardClient({
      legalName: input.legalName,
      displayName: input.displayName ?? null,
      defaultLocale: input.defaultLocale ?? null,
      defaultCurrency: input.defaultCurrency ?? null,
      adminEmail: input.adminEmail,
      adminPassword: input.adminPassword,
    });
    const access = await this.authorization.getAccessForUserInOrganization(
      initialAdmin.id,
      initialAdmin.organizationId,
    );
    return {
      client: toClientWorkspaceView(client),
      initialAdmin: toCurrentUserView(initialAdmin, access),
    };
  }
}
