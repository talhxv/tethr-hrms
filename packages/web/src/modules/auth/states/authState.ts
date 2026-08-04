import { atomWithStorage } from 'jotai/utils';

import type { PortalKind } from '@hrms/shared';

export type AuthUser = {
  readonly id: string;
  readonly email: string;
  readonly organizationId: string;
  readonly status: string;
  readonly employeeId: string | null;
  readonly roleKeys: readonly string[];
  readonly portal: PortalKind;
};

export type AuthSession = {
  readonly token: string;
  readonly user: AuthUser;
};

// Persisted to localStorage so a refresh keeps you signed in. The Apollo auth
// link reads the same key to attach the bearer token to every request.
export const AUTH_STORAGE_KEY = 'hrms.auth';

// getOnInit:true so the session is read from localStorage on the very first
// render — otherwise a refresh while signed in briefly sees `null` and the
// protected-route guard bounces the user to /login before hydration.
export const authState = atomWithStorage<AuthSession | null>(AUTH_STORAGE_KEY, null, undefined, {
  getOnInit: true,
});
