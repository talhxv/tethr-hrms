import { Column, Entity } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// A company within the organization. Payroll, statutory filings, and many
// authorization scopes are per legal entity (plan.md §3, §6).
@Entity('legal_entities')
export class LegalEntity extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 256 })
  name!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  registrationNumber!: string | null;

  @Column({ type: 'varchar', length: 2 })
  countryCode!: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency!: string;
}
