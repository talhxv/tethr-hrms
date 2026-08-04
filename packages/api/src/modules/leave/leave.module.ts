import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../core/auth/auth.module';
import { AuthzModule } from '../../core/authz/authz.module';
import { provideTenantScopedRepository } from '../../core/tenancy/tenant-repository.provider';

import { HolidayCalendar } from './entities/holiday-calendar.entity';
import { Holiday } from './entities/holiday.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveType } from './entities/leave-type.entity';
import { HolidayService } from './holiday.service';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveRequestService } from './leave-request.service';
import { LeaveTypeService } from './leave-type.service';
import { LeaveResolver } from './leave.resolver';
import {
  HOLIDAY_CALENDAR_REPOSITORY,
  HOLIDAY_REPOSITORY,
  LEAVE_BALANCE_REPOSITORY,
  LEAVE_REQUEST_REPOSITORY,
  LEAVE_TYPE_REPOSITORY,
} from './leave.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([LeaveType, LeaveBalance, LeaveRequest, HolidayCalendar, Holiday]),
    AuthModule,
    AuthzModule,
  ],
  providers: [
    LeaveTypeService,
    LeaveBalanceService,
    HolidayService,
    LeaveRequestService,
    LeaveResolver,
    provideTenantScopedRepository(LEAVE_TYPE_REPOSITORY, LeaveType),
    provideTenantScopedRepository(LEAVE_BALANCE_REPOSITORY, LeaveBalance),
    provideTenantScopedRepository(LEAVE_REQUEST_REPOSITORY, LeaveRequest),
    provideTenantScopedRepository(HOLIDAY_CALENDAR_REPOSITORY, HolidayCalendar),
    provideTenantScopedRepository(HOLIDAY_REPOSITORY, Holiday),
  ],
  exports: [LeaveTypeService, LeaveBalanceService, LeaveRequestService, HolidayService],
})
export class LeaveModule {}
