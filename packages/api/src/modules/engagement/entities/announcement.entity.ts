import type { AnnouncementAudience, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('announcements')
@Index(['organizationId', 'audience', 'publishedAt'])
export class Announcement extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 200 })
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({ type: 'varchar', length: 16, default: 'all' })
  audience!: AnnouncementAudience;

  @Column({ type: 'boolean', default: false })
  isPinned!: boolean;

  @Column({ type: 'timestamptz' })
  publishedAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt!: Date | null;

  @Column({ type: 'uuid' })
  publishedByUserId!: UserId;
}
