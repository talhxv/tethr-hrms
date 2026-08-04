import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// A named set of public holidays (often per country/region). A leave request can
// be costed against a calendar so holidays don't consume leave days.
@Entity('holiday_calendars')
@Index(['organizationId', 'name'], { unique: true })
export class HolidayCalendar extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 128 })
  name!: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  countryCode!: string | null;
}
