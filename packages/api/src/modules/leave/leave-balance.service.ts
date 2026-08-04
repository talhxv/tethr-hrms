import type { EmployeeId, LeaveTypeId } from '@hrms/shared';
import { Inject, Injectable } from '@nestjs/common';
import type { FindOptionsWhere } from 'typeorm';

import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';

import { LeaveBalance } from './entities/leave-balance.entity';
import { LEAVE_BALANCE_REPOSITORY } from './leave.tokens';

// Read access to leave balances. Mutations happen inside LeaveRequestService's
// transactions so balance changes commit atomically with the request.
@Injectable()
export class LeaveBalanceService {
  constructor(
    @Inject(LEAVE_BALANCE_REPOSITORY)
    private readonly balances: TenantScopedRepository<LeaveBalance>,
  ) {}

  listForEmployee(employeeId: EmployeeId): Promise<LeaveBalance[]> {
    return this.balances.find({ where: { employeeId } as FindOptionsWhere<LeaveBalance> });
  }

  getBalance(
    employeeId: EmployeeId,
    leaveTypeId: LeaveTypeId,
    periodYear: number,
  ): Promise<LeaveBalance | null> {
    return this.balances.findOne({
      where: { employeeId, leaveTypeId, periodYear } as FindOptionsWhere<LeaveBalance>,
    });
  }
}
