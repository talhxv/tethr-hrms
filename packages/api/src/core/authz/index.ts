export { AuthzModule } from './authz.module';
export { PermissionsGuard } from './permissions.guard';
export { RequirePermissions, PERMISSIONS_METADATA_KEY } from './require-permissions.decorator';
export { ALL_PERMISSIONS, PERMISSIONS, type Permission } from './permissions';
export { AuthorizationService, type EffectiveAccess } from './authz.service';
export { SYSTEM_ROLES, portalForRoleKeys } from './system-roles';
export { Role } from './role.entity';
