import { toId, type EmployeeId, type IsoDate, type UserId, type WorkerType } from '@hrms/shared';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { NotFoundError } from '../../common/errors';
import { AuditService } from '../../core/audit/audit.service';
import { DomainEventPublisher } from '../../core/events/domain-event-publisher.service';
import { TenantContextService } from '../../core/tenancy/tenant-context.service';
import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';

import { EMPLOYEE_REPOSITORY } from './employee.tokens';
import { Employee } from './entities/employee.entity';

export type CreateEmployeeData = {
  readonly employeeNumber: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly workEmail?: string | null;
  readonly roleTitle?: string | null;
  readonly dateOfBirth?: IsoDate | null;
  readonly probationEndDate?: IsoDate | null;
  readonly hireDate: IsoDate;
  readonly workerType?: WorkerType;
};

// Owns employee writes. State changes that other modules care about are announced
// via the transactional outbox in the SAME transaction as the write (plan.md §5.2,
// §10) — so a committed change always has its event, and a rolled-back one never does.
@Injectable()
export class EmployeeService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employees: TenantScopedRepository<Employee>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly publisher: DomainEventPublisher,
    private readonly tenantContext: TenantContextService,
    private readonly audit: AuditService,
  ) {}

  async create(input: CreateEmployeeData): Promise<Employee> {
    const organizationId = this.tenantContext.getOrganizationId();
    const employee = await this.dataSource.transaction(async (manager) => {
      const entity = manager.create(Employee, {
        organizationId,
        employeeNumber: input.employeeNumber,
        firstName: input.firstName,
        lastName: input.lastName,
        workEmail: input.workEmail ?? null,
        roleTitle: input.roleTitle ?? null,
        dateOfBirth: input.dateOfBirth ?? null,
        probationEndDate: input.probationEndDate ?? null,
        hireDate: input.hireDate,
        terminationDate: null,
        employmentStatus: 'active',
        workerType: input.workerType ?? 'permanent',
      });
      const saved = await manager.save(entity);
      await this.publisher.publishWithin(manager, {
        name: 'employee.created',
        payload: { employeeId: toId<EmployeeId>(saved.id) },
      });
      return saved;
    });

    await this.audit.record({
      action: 'create',
      resourceType: 'employee',
      resourceId: employee.id,
      after: {
        employeeNumber: employee.employeeNumber,
        employmentStatus: employee.employmentStatus,
      },
    });
    return employee;
  }

  async terminate(id: string, effectiveDate: IsoDate, reason: string): Promise<Employee> {
    const organizationId = this.tenantContext.getOrganizationId();
    const employee = await this.dataSource.transaction(async (manager) => {
      const entity = await manager.findOne(Employee, { where: { id, organizationId } });
      if (!entity) {
        throw new NotFoundError('Employee not found', { id });
      }
      entity.employmentStatus = 'terminated';
      entity.terminationDate = effectiveDate;
      const saved = await manager.save(entity);
      await this.publisher.publishWithin(manager, {
        name: 'employee.terminated',
        payload: { employeeId: toId<EmployeeId>(saved.id), effectiveDate, reason },
      });
      return saved;
    });

    await this.audit.record({
      action: 'terminate',
      resourceType: 'employee',
      resourceId: employee.id,
      after: { employmentStatus: 'terminated', terminationDate: effectiveDate },
    });
    return employee;
  }

  async updateRoleTitle(
    id: EmployeeId,
    roleTitle: string | null,
    updatedByUserId: UserId,
  ): Promise<Employee> {
    const organizationId = this.tenantContext.getOrganizationId();
    const employee = await this.dataSource.transaction(async (manager) => {
      const entity = await manager.findOne(Employee, { where: { id, organizationId } });
      if (!entity) {
        throw new NotFoundError('Employee not found', { id });
      }
      entity.roleTitle = roleTitle;
      const saved = await manager.save(entity);
      await this.publisher.publishWithin(manager, {
        name: 'employee.updated',
        payload: {
          employeeId: toId<EmployeeId>(saved.id),
          changedFields: ['roleTitle'],
        },
      });
      return saved;
    });

    await this.audit.record({
      action: 'update',
      resourceType: 'employee',
      resourceId: employee.id,
      after: { roleTitle: employee.roleTitle, updatedByUserId },
    });
    return employee;
  }

  list(): Promise<Employee[]> {
    return this.employees.find();
  }

  async getById(id: string): Promise<Employee> {
    const employee = await this.employees.findById(id);
    if (!employee) {
      throw new NotFoundError('Employee not found', { id });
    }
    return employee;
  }
}
