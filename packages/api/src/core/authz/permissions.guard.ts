import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ForbiddenError } from '../../common/errors';

import { AuthorizationService } from './authz.service';
import type { Permission } from './permissions';
import { PERMISSIONS_METADATA_KEY } from './require-permissions.decorator';

// Coarse authorization at the entrypoint: is the caller authenticated and do they
// hold the required permissions? Works for both GraphQL and REST. Not registered
// globally — applied with @UseGuards once the auth principal is populated.
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authorization: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<Permission[] | undefined>(
      PERMISSIONS_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) {
      return true;
    }

    const access = await this.authorization.getCurrentAccess();
    const granted = new Set(access.permissions);
    const hasEvery = required.every((permission) => granted.has(permission));
    if (!hasEvery) {
      throw new ForbiddenError();
    }
    return true;
  }
}
