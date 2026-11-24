import { toId, type EmployeeId, type SystemRoleKey, type UserId } from '@hrms/shared';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ValidationFailedError } from '../../common/errors';
import { AuditService } from '../audit/audit.service';
import { AuthorizationService } from '../authz/authz.service';
import { PERMISSIONS } from '../authz/permissions';
import { PermissionsGuard } from '../authz/permissions.guard';
import { RequirePermissions } from '../authz/require-permissions.decorator';

import { AuthService } from './auth.service';
import { AuthPayload } from './dto/auth-payload.output';
import { CreateWorkspaceUserInput } from './dto/create-workspace-user.input';
import { CurrentUserView, toCurrentUserView } from './dto/current-user.output';
import { ChangeMyPasswordInput, ResetWorkspaceUserPasswordInput } from './dto/password.inputs';
import { SelectWorkspaceInput } from './dto/select-workspace.input';
import { TemporaryPasswordIssuedView } from './dto/temporary-password.output';
import { UpdateWorkspaceUserRoleInput } from './dto/update-workspace-user-role.input';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly authorization: AuthorizationService,
    private readonly audit: AuditService,
  ) {}

  // Redeems the short-lived token from a multi-workspace login (AccountService)
  // for a real session, once the user has picked which workspace to enter.
  @Mutation(() => AuthPayload)
  async selectWorkspace(@Args('input') input: SelectWorkspaceInput): Promise<AuthPayload> {
    const user = await this.authService.resolveWorkspaceSelection(
      input.selectionToken,
      input.organizationId,
    );
    const access = await this.authorization.getAccessForUserInOrganization(
      user.id,
      user.organizationId,
    );
    return { token: this.authService.issueToken(user), user: toCurrentUserView(user, access) };
  }

  // Public precheck for the signup form: warns "you may already have an
  // account" without revealing anything about which workspace(s) — no auth
  // required, same trust boundary as login/signUp themselves.
  @Query(() => Boolean)
  emailIsAlreadyRegistered(@Args('email') email: string): Promise<boolean> {
    return this.authService.emailIsAlreadyRegistered(email);
  }

  @Query(() => CurrentUserView)
  async me(): Promise<CurrentUserView> {
    const user = await this.authService.getCurrentUser();
    return toCurrentUserView(user, await this.authorization.getCurrentAccess());
  }

  @Query(() => Boolean)
  async hasOtherWorkspaces(): Promise<boolean> {
    return this.authService.hasOtherWorkspaces();
  }

  @Query(() => [CurrentUserView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.userManage)
  async workspaceUsers(): Promise<CurrentUserView[]> {
    const users = await this.authService.listUsers();
    // One batched access lookup per workspace, not two queries per user: each
    // query is a slow cross-region round trip.
    const organizationIds = [...new Set(users.map((user) => String(user.organizationId)))];
    const accessByOrganization = new Map(
      await Promise.all(
        organizationIds.map(
          async (organizationId) =>
            [
              organizationId,
              await this.authorization.getAccessForUsersInOrganization(
                users
                  .filter((user) => String(user.organizationId) === organizationId)
                  .map((user) => user.id),
                organizationId,
              ),
            ] as const,
        ),
      ),
    );
    return users.map((user) =>
      toCurrentUserView(
        user,
        accessByOrganization.get(String(user.organizationId))?.get(String(user.id)) ?? {
          roleKeys: [],
          permissions: [],
          portal: 'none',
        },
      ),
    );
  }

  @Query(() => [String])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.userManage)
  async assignableWorkspaceRoles(): Promise<string[]> {
    return [...(await this.authorization.listAssignableSystemRoleKeys())];
  }

  @Mutation(() => CurrentUserView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.userManage)
  async createWorkspaceUser(
    @Args('input') input: CreateWorkspaceUserInput,
  ): Promise<CurrentUserView> {
    const roleKey = input.roleKey as SystemRoleKey;
    await this.authorization.assertCurrentUserCanAssign(roleKey);
    if (roleKey === 'employee' && !input.employeeId) {
      throw new ValidationFailedError('employeeId is required when creating an employee account');
    }
    const user = await this.authService.createUser({
      email: input.email,
      password: input.password,
      employeeId: input.employeeId ? toId<EmployeeId>(input.employeeId) : null,
      // The administrator chose this password, so the person replaces it.
      mustChangePassword: true,
    });
    await this.authorization.assignSystemRole(toId<UserId>(user.id), roleKey);
    return toCurrentUserView(
      user,
      await this.authorization.getAccessForUserInOrganization(user.id, user.organizationId),
    );
  }

  @Mutation(() => CurrentUserView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.userManage)
  async updateWorkspaceUserRole(
    @Args('input') input: UpdateWorkspaceUserRoleInput,
  ): Promise<CurrentUserView> {
    const roleKey = input.roleKey as SystemRoleKey;
    await this.authorization.assertCurrentUserCanAssign(roleKey);
    let user = await this.authService.getUserById(input.userId);
    if (input.employeeId !== undefined) {
      user = await this.authService.updateUserEmployeeLink(
        toId<UserId>(user.id),
        input.employeeId ? toId<EmployeeId>(input.employeeId) : null,
      );
    }
    if (roleKey === 'employee' && !user.employeeId) {
      throw new ValidationFailedError('employeeId is required before assigning employee access');
    }
    await this.authorization.replaceSystemRole(toId<UserId>(user.id), roleKey);
    return toCurrentUserView(
      user,
      await this.authorization.getAccessForUserInOrganization(user.id, user.organizationId),
    );
  }

  // Controlled account recovery: issue a one-time password for someone in
  // this workspace. The caller must be allowed to assign every role the
  // target holds (a client admin cannot reset a Tethr admin), and cannot use
  // this on their own login — that is what changeMyPassword is for.
  @Mutation(() => TemporaryPasswordIssuedView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.userManage)
  async resetWorkspaceUserPassword(
    @Args('input') input: ResetWorkspaceUserPasswordInput,
  ): Promise<TemporaryPasswordIssuedView> {
    const caller = await this.authService.getCurrentUser();
    if (caller.id === input.userId) {
      throw new ValidationFailedError('Use "Change password" to change your own password');
    }
    const target = await this.authService.getUserById(input.userId);
    const targetAccess = await this.authorization.getAccessForUserInOrganization(
      target.id,
      target.organizationId,
    );
    for (const roleKey of targetAccess.roleKeys) {
      await this.authorization.assertCurrentUserCanAssign(roleKey as SystemRoleKey);
    }
    const { user, temporaryPassword } = await this.authService.issueTemporaryPassword(target.id);
    await this.audit.record({
      action: 'password.reset',
      resourceType: 'user',
      resourceId: user.id,
      metadata: { mustChangePassword: true },
    });
    return { user: toCurrentUserView(user, targetAccess), temporaryPassword };
  }

  @Mutation(() => CurrentUserView)
  async changeMyPassword(@Args('input') input: ChangeMyPasswordInput): Promise<CurrentUserView> {
    const user = await this.authService.changeOwnPassword(input.currentPassword, input.newPassword);
    await this.audit.record({
      action: 'password.changed',
      resourceType: 'user',
      resourceId: user.id,
      metadata: {},
    });
    return toCurrentUserView(user, await this.authorization.getCurrentAccess());
  }
}
