import type { OrganizationKind } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { BaseEntity } from '../../../core/database/entities/base.entity';

// The tenant root. An Organization is NOT tenant-scoped — it IS the tenant; its
// `id` is the organizationId every other row carries. Everything else in the
// system hangs off this (plan.md §3).
@Entity('organizations')
export class Organization extends BaseEntity {
  @Index()
  @Column({ type: 'varchar', length: 16, default: 'client' })
  kind!: OrganizationKind;

  @Column({ type: 'varchar', length: 256 })
  legalName!: string;

  @Column({ type: 'varchar', length: 256 })
  displayName!: string;

  @Column({ type: 'varchar', length: 8, default: 'en' })
  defaultLocale!: string;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  defaultCurrency!: string;

  @Column({ type: 'jsonb', default: () => "'{}'" })
  settings!: Record<string, unknown>;
}
