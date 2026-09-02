import type { EmployeeId, EmployeeOffboardingTaskStatus, UserId } from '@hrms/shared';
import { toId, type EmployeeOffboardingTaskId } from '@hrms/shared';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';

import { NotFoundError } from '../../common/errors';
import { AuditService } from '../../core/audit/audit.service';
import { DomainEventPublisher } from '../../core/events/domain-event-publisher.service';
import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';
import { EMPLOYEE_OFFBOARDING_TASK_REPOSITORY } from './employee.tokens';
import { EmployeeOffboardingTask, type EmployeeOffboardingTaskKey } from './entities/employee-offboarding-task.entity';

@Injectable()
export class EmployeeOffboardingService {
  constructor(
    @Inject(EMPLOYEE_OFFBOARDING_TASK_REPOSITORY)
    private readonly tasks: TenantScopedRepository<EmployeeOffboardingTask>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly publisher: DomainEventPublisher,
    private readonly audit: AuditService,
  ) {}

  listForEmployee(employeeId: EmployeeId): Promise<EmployeeOffboardingTask[]> {
    return this.tasks.find({ where: { employeeId } as FindOptionsWhere<EmployeeOffboardingTask>, order: { createdAt: 'ASC' } });
  }

  async updateTask(
    employeeId: EmployeeId,
    taskKey: EmployeeOffboardingTaskKey,
    input: { status: EmployeeOffboardingTaskStatus; dueDate?: string | null; notes?: string | null; updatedByUserId: UserId },
  ): Promise<EmployeeOffboardingTask> {
    const existing = await this.tasks.findOne({ where: { employeeId, taskKey } as FindOptionsWhere<EmployeeOffboardingTask> });
    if (!existing) throw new NotFoundError('Offboarding task not found', { employeeId, taskKey });
    existing.status = input.status;
    if (input.dueDate !== undefined) existing.dueDate = input.dueDate;
    if (input.notes !== undefined) existing.notes = input.notes;
    existing.updatedByUserId = input.updatedByUserId;
    if (input.status === 'completed') {
      existing.completedAt = existing.completedAt ?? new Date();
      existing.completedByUserId = existing.completedByUserId ?? input.updatedByUserId;
    } else {
      existing.completedAt = null;
      existing.completedByUserId = null;
    }
    const saved = await this.dataSource.transaction(async (manager) => {
      const persisted = await manager.save(existing);
      await this.publisher.publishWithin(manager, {
        name: 'employee.offboardingTaskUpdated',
        payload: {
          employeeOffboardingTaskId: toId<EmployeeOffboardingTaskId>(persisted.id),
          employeeId,
          status: input.status,
        },
      });
      return persisted;
    });
    await this.audit.record({ action: 'update', resourceType: 'employee_offboarding_task', resourceId: saved.id, after: { employeeId, taskKey, status: input.status } });
    return saved;
  }
}
