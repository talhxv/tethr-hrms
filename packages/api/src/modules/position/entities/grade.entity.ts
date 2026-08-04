import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('grades')
@Index(['organizationId', 'code'], { unique: true })
export class Grade extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 32 })
  code!: string;

  @Column({ type: 'int', default: 0 })
  level!: number;
}
