import {
  rangesOverlap,
  toId,
  type AssignmentId,
  type AssignmentType,
  type DateRange,
  type EmployeeId,
  type IsoDate,
  type PositionId,
} from '@hrms/shared';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import type { FindOptionsWhere } from 'typeorm';

import { EffectiveDatingError, NotFoundError } from '../../common/errors';
import { DomainEventPublisher } from '../../core/events/domain-event-publisher.service';
import { TenantContextService } from '../../core/tenancy/tenant-context.service';
import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';

import { ASSIGNMENT_REPOSITORY } from './assignment.tokens';
import { Assignment } from './entities/assignment.entity';


export type CreateAssignmentInput = {
  readonly employeeId: EmployeeId;
  readonly positionId: PositionId;
  readonly validFrom: IsoDate;
  readonly validTo?: IsoDate | null;
  readonly assignmentType?: AssignmentType;
  readonly reportsToEmployeeId?: EmployeeId | null;
  readonly isPrimary?: boolean;
};

@Injectable()
export class AssignmentService {
  constructor(
    @Inject(ASSIGNMENT_REPOSITORY) private readonly assignments: TenantScopedRepository<Assignment>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly publisher: DomainEventPublisher,
    private readonly tenantContext: TenantContextService,
  ) {}

  async create(input: CreateAssignmentInput): Promise<Assignment> {
    const isPrimary = input.isPrimary ?? true;
    if (isPrimary) {
      await this.assertNoPrimaryOverlap(input.employeeId, {
        validFrom: input.validFrom,
        validTo: input.validTo ?? null,
      });
    }

    const organizationId = this.tenantContext.getOrganizationId();
    return this.dataSource.transaction(async (manager) => {
      const entity = manager.create(Assignment, {
        organizationId,
        employeeId: input.employeeId,
        positionId: input.positionId,
        assignmentType: input.assignmentType ?? 'primary',
        reportsToEmployeeId: input.reportsToEmployeeId ?? null,
        isPrimary,
        validFrom: input.validFrom,
        validTo: input.validTo ?? null,
      });
      const saved = await manager.save(entity);
      await this.publisher.publishWithin(manager, {
        name: 'assignment.created',
        payload: {
          assignmentId: toId<AssignmentId>(saved.id),
          employeeId: input.employeeId,
          positionId: input.positionId,
          effectiveDate: input.validFrom,
        },
      });
      return saved;
    });
  }

  async end(id: string, effectiveDate: IsoDate): Promise<Assignment> {
    const organizationId = this.tenantContext.getOrganizationId();
    return this.dataSource.transaction(async (manager) => {
      const entity = await manager.findOne(Assignment, { where: { id, organizationId } });
      if (!entity) {
        throw new NotFoundError('Assignment not found', { id });
      }
      entity.validTo = effectiveDate;
      const saved = await manager.save(entity);
      await this.publisher.publishWithin(manager, {
        name: 'assignment.ended',
        payload: { assignmentId: toId<AssignmentId>(saved.id), employeeId: entity.employeeId, effectiveDate },
      });
      return saved;
    });
  }

  listForEmployee(employeeId: EmployeeId): Promise<Assignment[]> {
    return this.assignments.find({ where: { employeeId } as FindOptionsWhere<Assignment> });
  }

  // A person holds at most one primary assignment at any moment. Reuses the
  // shared half-open range math so the overlap rule is identical everywhere.
  private async assertNoPrimaryOverlap(employeeId: EmployeeId, range: DateRange): Promise<void> {
    const existing = await this.assignments.find({
      where: { employeeId, isPrimary: true } as FindOptionsWhere<Assignment>,
    });
    const conflict = existing.find((assignment) =>
      rangesOverlap({ validFrom: assignment.validFrom, validTo: assignment.validTo }, range),
    );
    if (conflict) {
      throw new EffectiveDatingError('A primary assignment already exists for this period', {
        employeeId,
        conflictingAssignmentId: conflict.id,
      });
    }
  }
}
