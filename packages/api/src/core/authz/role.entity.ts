import type { DataScope } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../database/entities/tenant-scoped.entity';

// A role bundles permissions and a data scope. Scope answers "over which records"
// — payroll-admin for one legal entity is not payroll-admin for another (plan.md
// §6). Roles are tenant data, edited by admins, not code.
@Entity('roles')
@Index(['organizationId', 'name'], { unique: true })
@Index(['organizationId', 'key'], { unique: true })
export class Role extends TenantScopedEntity {
  // Null marks a tenant-defined custom role. System role keys are stable so the
  // product can seed and recognize its initial portals without role-name checks.
  @Column({ type: 'varchar', length: 64, nullable: true })
  key!: string | null;

  @Column({ type: 'varchar', length: 64 })
  name!: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  permissions!: string[];

  @Column({ type: 'varchar', length: 16, default: 'own' })
  dataScope!: DataScope;
}
