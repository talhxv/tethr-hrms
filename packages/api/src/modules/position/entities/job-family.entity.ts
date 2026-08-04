import { Column, Entity } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('job_families')
export class JobFamily extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 128 })
  name!: string;
}
