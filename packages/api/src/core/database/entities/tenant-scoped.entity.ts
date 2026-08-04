import type { OrganizationId } from '@hrms/shared';
import { Column, Index } from 'typeorm';

import { BaseEntity } from './base.entity';


// Every tenant-owned row carries its organization id. The TenantScopedRepository
// injects this into every query, so code cannot forget to scope (plan.md §6,
// "multi-tenancy"). This is a plain indexed column — deliberately NOT a foreign
// key into the organization module's table (non-negotiable #2: no cross-module
// FKs), which is what keeps any module extractable later.
export abstract class TenantScopedEntity extends BaseEntity {
  @Index()
  @Column('uuid')
  organizationId!: OrganizationId;
}
