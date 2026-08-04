import type { LegalEntityId } from '@hrms/shared';
import { Column, Entity } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// An office or work site. References its legal entity by ID only (no FK).
@Entity('locations')
export class Location extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  legalEntityId!: LegalEntityId;

  @Column({ type: 'varchar', length: 256 })
  name!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  timezone!: string | null;

  @Column({ type: 'varchar', length: 2, nullable: true })
  countryCode!: string | null;
}
