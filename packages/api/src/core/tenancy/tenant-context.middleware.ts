import { Injectable, type NestMiddleware } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { toId, type OrganizationId, type UserId } from '@hrms/shared';

import { TenantContextService } from './tenant-context.service';

import type { JwtClaims } from '../auth/jwt-claims';

// Minimal request shape — avoids depending on express types here.
type RequestLike = {
  headers: Record<string, string | string[] | undefined>;
  user?: unknown;
};

// Establishes tenant + principal for the request from the `Authorization: Bearer`
// JWT. Falls back to an `x-organization-id` header as an unauthenticated dev shim
// (for tooling). Requests with neither proceed; any downstream tenant-scoped read
// then fails loudly rather than leaking across tenants.
@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly jwtService: JwtService,
  ) {}

  use(request: RequestLike, _response: unknown, next: (error?: unknown) => void): void {
    const claims = this.readToken(request);
    if (claims) {
      const organizationId = toId<OrganizationId>(claims.org);
      const userId = toId<UserId>(claims.sub);
      request.user = { userId, organizationId, email: claims.email, permissions: [] };
      this.tenantContext.run({ organizationId, userId }, () => next());
      return;
    }

    const header = request.headers['x-organization-id'];
    const organizationId = typeof header === 'string' && header.length > 0 ? header : null;
    if (organizationId === null) {
      next();
      return;
    }
    this.tenantContext.run(
      { organizationId: toId<OrganizationId>(organizationId), userId: null },
      () => next(),
    );
  }

  private readToken(request: RequestLike): JwtClaims | null {
    const header = request.headers['authorization'];
    const value = typeof header === 'string' ? header : null;
    if (!value || !value.startsWith('Bearer ')) {
      return null;
    }
    try {
      return this.jwtService.verify<JwtClaims>(value.slice('Bearer '.length));
    } catch {
      return null;
    }
  }
}
