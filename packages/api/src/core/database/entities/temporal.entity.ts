import type { IsoDate } from '@hrms/shared';
import { Column, Index } from 'typeorm';

import { TenantScopedEntity } from './tenant-scoped.entity';


// An effective-dated backbone fact (non-negotiable #4). validFrom is inclusive,
// validTo is exclusive, null validTo means open-ended — matching the half-open
// DateRange semantics in @hrms/shared. Postgres `date` columns surface as
// 'YYYY-MM-DD' strings, which is exactly IsoDate.
//
// Subclasses should enforce non-overlap of ranges per business key (e.g. one
// active salary per employee at a time) in their service, using rangesOverlap.
export abstract class TemporalEntity extends TenantScopedEntity {
  @Index()
  @Column({ type: 'date' })
  validFrom!: IsoDate;

  @Column({ type: 'date', nullable: true })
  validTo!: IsoDate | null;
}
