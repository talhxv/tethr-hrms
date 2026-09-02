import type {
  EmployeeId,
  EmployeeSeparationId,
  ExitInterviewDecision,
  ExitInterviewStatus,
  UserId,
} from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_exit_interviews')
@Index(['organizationId', 'employeeId'])
@Index(['organizationId', 'separationId'], { unique: true })
export class EmployeeExitInterview extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'uuid' })
  separationId!: EmployeeSeparationId;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status!: ExitInterviewStatus;

  @Column({ type: 'date', nullable: true })
  scheduledDate!: string | null;

  // Stored as comma-separated or json array; simplest as text containing JSON
  @Column({ type: 'text', nullable: true })
  interviewerUserIdsJson!: string | null;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  finalDecision!: ExitInterviewDecision | null;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;

  get interviewerUserIds(): UserId[] {
    if (!this.interviewerUserIdsJson) return [];
    try {
      const parsed = JSON.parse(this.interviewerUserIdsJson) as unknown;
      return Array.isArray(parsed) ? (parsed as UserId[]) : [];
    } catch {
      return [];
    }
  }

  set interviewerUserIds(value: UserId[]) {
    this.interviewerUserIdsJson = JSON.stringify(value);
  }
}
