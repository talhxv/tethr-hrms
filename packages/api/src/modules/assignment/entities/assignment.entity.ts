import type { AssignmentType, EmployeeId, PositionId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TemporalEntity } from '../../../core/database/entities/temporal.entity';


// The indirection between an employee and a position (plan.md §3.2). Because it is
// effective-dated (extends TemporalEntity), it models transfers, promotions,
// acting/dual roles, and accurate org-chart history for free: close one
// assignment, open another. References employee and position by ID only.
@Entity('assignments')
@Index(['organizationId', 'employeeId'])
export class Assignment extends TemporalEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'uuid' })
  positionId!: PositionId;

  @Column({ type: 'varchar', length: 16, default: 'primary' })
  assignmentType!: AssignmentType;

  @Column({ type: 'uuid', nullable: true })
  reportsToEmployeeId!: EmployeeId | null;

  @Column({ type: 'boolean', default: true })
  isPrimary!: boolean;
}
