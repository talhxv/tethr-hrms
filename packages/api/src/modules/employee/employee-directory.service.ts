import type { EmployeeId } from '@hrms/shared';
import { Inject, Injectable } from '@nestjs/common';

import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';

import { EMPLOYEE_REPOSITORY } from './employee.tokens';
import { Employee } from './entities/employee.entity';

// The published read interface for employee facts (plan.md §5.1). When Leave needs
// an employee's name or manager to route an approval, it calls this — it does NOT
// JOIN into the employees table. The storage behind this interface is private to
// the employee module, which is what keeps the module independently extractable.
@Injectable()
export class EmployeeDirectoryService {
  constructor(
    @Inject(EMPLOYEE_REPOSITORY) private readonly employees: TenantScopedRepository<Employee>,
  ) {}

  getById(employeeId: EmployeeId): Promise<Employee | null> {
    return this.employees.findById(employeeId);
  }

  async exists(employeeId: EmployeeId): Promise<boolean> {
    return (await this.employees.findById(employeeId)) !== null;
  }

  async getDisplayName(employeeId: EmployeeId): Promise<string | null> {
    const employee = await this.employees.findById(employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : null;
  }
}
