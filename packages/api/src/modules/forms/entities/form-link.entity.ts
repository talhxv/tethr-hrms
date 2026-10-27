import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('form_links')
@Index(['slug'], { unique: true })
export class FormLink extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 16 })
  slug!: string;

  @Column({ type: 'uuid' })
  formDefinitionId!: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  refId!: string | null;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;
}
