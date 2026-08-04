import type { CostCenterId, DepartmentId, EmployeeId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// A unit in the org chart. Parent department, cost center, and head are all
// references by ID (the parent self-reference stays within this module; the
// head is an employee in another module — referenced by ID, never a FK).
@Entity('departments')
@Index(['organizationId', 'name'])
export class Department extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 256 })
  name!: string;

  @Column({ type: 'uuid', nullable: true })
  parentDepartmentId!: DepartmentId | null;

  @Column({ type: 'uuid', nullable: true })
  costCenterId!: CostCenterId | null;

  @Column({ type: 'uuid', nullable: true })
  headEmployeeId!: EmployeeId | null;
}
