import type { HolidayCalendarId, IsoDate } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('holidays')
@Index(['organizationId', 'calendarId', 'date'], { unique: true })
export class Holiday extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  calendarId!: HolidayCalendarId;

  @Column({ type: 'date' })
  date!: IsoDate;

  @Column({ type: 'varchar', length: 128 })
  name!: string;
}
