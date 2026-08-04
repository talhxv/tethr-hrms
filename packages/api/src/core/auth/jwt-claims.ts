// The signed JWT payload. Kept tiny and stateless: the user, their tenant, and
// email. The TenantContextMiddleware verifies this and establishes tenant +
// principal from it, so no per-request DB lookup is needed for auth.
export type JwtClaims = {
  readonly sub: string;
  readonly org: string;
  readonly email: string;
};
