import type { EmployeeId, SeparationType, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_separations')
@Index(['organizationId', 'employeeId'])
export class EmployeeSeparation extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'varchar', length: 16 })
  type!: SeparationType;

  @Column({ type: 'date', nullable: true })
  resignationLetterDate!: string | null;

  @Column({ type: 'date', nullable: true })
  relievingDate!: string | null;

  @Column({ type: 'text', nullable: true })
  reasonForLeaving!: string | null;

  @Column({ type: 'boolean', default: false })
  leaveEncashed!: boolean;

  @Column({ type: 'date', nullable: true })
  encashmentDate!: string | null;

  @Column({ type: 'date', nullable: true })
  heldOn!: string | null;

  @Column({ type: 'varchar', length: 256, nullable: true })
  newWorkplace!: string | null;

  @Column({ type: 'text', nullable: true })
  feedback!: string | null;

  @Column({ type: 'uuid', nullable: true })
  initiatedByUserId!: UserId | null;
}
