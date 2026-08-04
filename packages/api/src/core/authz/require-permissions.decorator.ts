import { SetMetadata } from '@nestjs/common';

import type { Permission } from './permissions';

export const PERMISSIONS_METADATA_KEY = 'hrms:required-permissions';

// Declares the permissions a resolver/handler requires. The PermissionsGuard
// reads this metadata. Coarse authentication belongs in a guard; fine-grained
// per-record checks belong in the service (architecture.md §2.4).
export const RequirePermissions = (
  ...permissions: Permission[]
): MethodDecorator & ClassDecorator => SetMetadata(PERMISSIONS_METADATA_KEY, permissions);
