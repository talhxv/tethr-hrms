// The signed JWT payload. Kept tiny and stateless: the user, their tenant, and
// email. The TenantContextMiddleware verifies this and establishes tenant +
// principal from it, so no per-request DB lookup is needed for auth.
export type JwtClaims = {
  readonly sub: string;
  readonly org: string;
  readonly email: string;
};

// Issued instead of a session JWT when a login's email matches more than one
// organization (the same person holding a distinct account per workspace they
// support). Deliberately shaped nothing like JwtClaims — no `sub`/`org` — so
// TenantContextMiddleware can never mistake it for a session token, and it is
// short-lived and single-purpose: it only ever redeems into one of the
// candidate organizations whose password check already passed at login.
export type WorkspaceSelectionClaims = {
  readonly type: 'workspace-selection';
  readonly email: string;
  readonly organizationIds: readonly string[];
};
