import { Query, Resolver } from '@nestjs/graphql';

// Guarantees the GraphQL schema always has at least one root query, and serves as
// a liveness probe.
@Resolver()
export class HealthResolver {
  @Query(() => String, { description: 'Liveness probe — returns "ok".' })
  health(): string {
    return 'ok';
  }
}
