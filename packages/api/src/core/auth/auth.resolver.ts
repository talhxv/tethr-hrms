import { toId, type EmployeeId, type SystemRoleKey, type UserId } from '@hrms/shared';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ValidationFailedError } from '../../common/errors';
import { AuthorizationService } from '../authz/authz.service';
import { PERMISSIONS } from '../authz/permissions';
import { PermissionsGuard } from '../authz/permissions.guard';
import { RequirePermissions } from '../authz/require-permissions.decorator';

import { AuthService } from './auth.service';
import { AuthPayload } from './dto/auth-payload.output';
import { CreateWorkspaceUserInput } from './dto/create-workspace-user.input';
import { CurrentUserView, toCurrentUserView } from './dto/current-user.output';
import { LoginInput } from './dto/login.input';
import { UpdateWorkspaceUserRoleInput } from './dto/update-workspace-user-role.input';

@Resolver()
export class AuthResolver {
  constructor(
    private readonly authService: AuthService,
    private readonly authorization: AuthorizationService,
  ) {}

  @Mutation(() => AuthPayload)
  async login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    const { user, token } = await this.authService.login(input.email, input.password);
    const access = await this.authorization.getAccessForUserInOrganization(
      user.id,
      user.organizationId,
    );
    return { token, user: toCurrentUserView(user, access) };
  }

  @Query(() => CurrentUserView)
  async me(): Promise<CurrentUserView> {
    const user = await this.authService.getCurrentUser();
    return toCurrentUserView(user, await this.authorization.getCurrentAccess());
  }

  @Query(() => [CurrentUserView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.userManage)
  async workspaceUsers(): Promise<CurrentUserView[]> {
    const users = await this.authService.listUsers();
    return Promise.all(
      users.map(async (user) =>
        toCurrentUserView(
          user,
          await this.authorization.getAccessForUserInOrganization(user.id, user.organizationId),
        ),
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
}
