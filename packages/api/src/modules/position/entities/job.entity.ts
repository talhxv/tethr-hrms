import type { JobFamilyId } from '@hrms/shared';
import { Column, Entity } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';


// A job is the abstract role ("Software Engineer"); a Position is a concrete seat
// of that job in a department. Assignments attach to positions (plan.md §3.2).
@Entity('jobs')
export class Job extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 128 })
  title!: string;

  @Column({ type: 'uuid', nullable: true })
  jobFamilyId!: JobFamilyId | null;
}
