import { Field, ID, ObjectType } from '@nestjs/graphql';

import type { Organization } from '../entities/organization.entity';

// A workspace (Organization) as seen from Tethr's client-management screens —
// shared by AccountResolver (onboarding) and ClientResolver (a client's
// workspace list), so the two never drift into two different shapes for the
// same underlying Organization projection.
@ObjectType('WorkspaceSummary')
export class WorkspaceSummaryView {
  @Field(() => ID)
  id!: string;

  @Field()
  legalName!: string;

  @Field()
  displayName!: string;

  @Field()
  kind!: string;

  @Field()
  defaultLocale!: string;

  @Field()
  defaultCurrency!: string;

  @Field()
  brandColor!: string;

  @Field()
  createdAt!: string;
}

export const toWorkspaceSummaryView = (organization: Organization): WorkspaceSummaryView => ({
  id: organization.id,
  legalName: organization.legalName,
  displayName: organization.displayName,
  kind: organization.kind,
  defaultLocale: organization.defaultLocale,
  defaultCurrency: organization.defaultCurrency,
  brandColor: organization.brandColor,
  createdAt: organization.createdAt.toISOString(),
});
