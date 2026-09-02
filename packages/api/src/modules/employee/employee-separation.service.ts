import type { EmployeeId } from '@hrms/shared';
import { Inject, Injectable } from '@nestjs/common';
import type { FindOptionsWhere } from 'typeorm';

import { NotFoundError } from '../../common/errors';
import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';
import { EMPLOYEE_SEPARATION_REPOSITORY } from './employee.tokens';
import { EmployeeSeparation } from './entities/employee-separation.entity';

@Injectable()
export class EmployeeSeparationService {
  constructor(
    @Inject(EMPLOYEE_SEPARATION_REPOSITORY)
    private readonly separations: TenantScopedRepository<EmployeeSeparation>,
  ) {}

  listForEmployee(employeeId: EmployeeId): Promise<EmployeeSeparation[]> {
    return this.separations.find({ where: { employeeId } as FindOptionsWhere<EmployeeSeparation>, order: { createdAt: 'DESC' } });
  }

  getById(id: string): Promise<EmployeeSeparation | null> {
    return this.separations.findById(id);
  }

  async getForEmployeeOrThrow(employeeId: EmployeeId): Promise<EmployeeSeparation | null> {
    const rows = await this.listForEmployee(employeeId);
    return rows[0] ?? null;
  }

  async update(id: string, input: Partial<Pick<EmployeeSeparation, 'reasonForLeaving' | 'leaveEncashed' | 'encashmentDate' | 'heldOn' | 'newWorkplace' | 'feedback' | 'relievingDate'>>): Promise<EmployeeSeparation> {
    const existing = await this.separations.findById(id);
    if (!existing) throw new NotFoundError('Separation not found', { id });
    for (const [key, value] of Object.entries(input) as [keyof typeof input, unknown][]) {
      if (value !== undefined) {
        (existing as unknown as Record<string, unknown>)[key] = value;
      }
    }
    return this.separations.save(existing);
  }
}
