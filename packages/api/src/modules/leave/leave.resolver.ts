import {
  toId,
  type EmployeeId,
  type HolidayCalendarId,
  type LeaveTypeId,
  type UserId,
} from '@hrms/shared';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { NotFoundError } from '../../common/errors';
import { AuthService } from '../../core/auth/auth.service';
import { PERMISSIONS } from '../../core/authz/permissions';
import { PermissionsGuard } from '../../core/authz/permissions.guard';
import { RequirePermissions } from '../../core/authz/require-permissions.decorator';

import { CreateLeaveTypeInput } from './dto/create-leave-type.input';
import { DecideLeaveRequestInput } from './dto/decide-leave-request.input';
import { HolidayView } from './dto/holiday.output';
import { LeaveBalanceView } from './dto/leave-balance.output';
import { LeaveRequestView } from './dto/leave-request.output';
import { LeaveTypeView } from './dto/leave-type.output';
import { ReviewLeaveRequestInput } from './dto/review-leave-request.input';
import { SubmitLeaveRequestInput } from './dto/submit-leave-request.input';
import { SubmitMyLeaveRequestInput } from './dto/submit-my-leave-request.input';
import { Holiday } from './entities/holiday.entity';
import { LeaveBalance } from './entities/leave-balance.entity';
import { LeaveRequest } from './entities/leave-request.entity';
import { LeaveType, type LeaveUnit } from './entities/leave-type.entity';
import { HolidayService } from './holiday.service';
import { LeaveBalanceService } from './leave-balance.service';
import { LeaveRequestService } from './leave-request.service';
import { LeaveTypeService } from './leave-type.service';

const toLeaveTypeView = (leaveType: LeaveType): LeaveTypeView => ({
  id: leaveType.id,
  name: leaveType.name,
  code: leaveType.code,
  unit: leaveType.unit,
  paid: leaveType.paid,
  requiresApproval: leaveType.requiresApproval,
  defaultAnnualEntitlement: Number(leaveType.defaultAnnualEntitlement),
});

const toLeaveRequestView = (request: LeaveRequest): LeaveRequestView => ({
  id: request.id,
  employeeId: request.employeeId,
  leaveTypeId: request.leaveTypeId,
  startDate: request.startDate,
  endDate: request.endDate,
  dayCount: Number(request.dayCount),
  status: request.status,
  reason: request.reason,
  submittedAt: request.createdAt.toISOString(),
  decidedAt: request.status === 'pending' ? null : request.updatedAt.toISOString(),
  decidedByUserId: request.decidedByUserId,
  decisionNote: request.decisionNote,
});

const toLeaveBalanceView = (balance: LeaveBalance): LeaveBalanceView => ({
  id: balance.id,
  leaveTypeId: balance.leaveTypeId,
  periodYear: balance.periodYear,
  entitledDays: Number(balance.entitledDays),
  usedDays: Number(balance.usedDays),
  pendingDays: Number(balance.pendingDays),
  availableDays:
    Number(balance.entitledDays) - Number(balance.usedDays) - Number(balance.pendingDays),
});

const toHolidayView = (holiday: Holiday): HolidayView => ({
  id: holiday.id,
  date: holiday.date,
  name: holiday.name,
});

@Resolver(() => LeaveRequestView)
export class LeaveResolver {
  constructor(
    private readonly leaveTypeService: LeaveTypeService,
    private readonly leaveRequestService: LeaveRequestService,
    private readonly leaveBalanceService: LeaveBalanceService,
    private readonly holidayService: HolidayService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => [LeaveTypeView])
  async leaveTypes(): Promise<LeaveTypeView[]> {
    return (await this.leaveTypeService.list()).map(toLeaveTypeView);
  }

  @Mutation(() => LeaveTypeView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveApprove)
  async createLeaveType(@Args('input') input: CreateLeaveTypeInput): Promise<LeaveTypeView> {
    const leaveType = await this.leaveTypeService.create({
      name: input.name,
      code: input.code,
      unit: input.unit as LeaveUnit | undefined,
      paid: input.paid,
      requiresApproval: input.requiresApproval,
      defaultAnnualEntitlement: input.defaultAnnualEntitlement,
    });
    return toLeaveTypeView(leaveType);
  }

  @Query(() => [LeaveRequestView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveTeamRead)
  async leaveRequests(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<LeaveRequestView[]> {
    const requests = await this.leaveRequestService.listForEmployee(toId<EmployeeId>(employeeId));
    return requests.map(toLeaveRequestView);
  }

  @Query(() => [LeaveRequestView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveTeamRead)
  async leaveRequestInbox(): Promise<LeaveRequestView[]> {
    return (await this.leaveRequestService.listAll()).map(toLeaveRequestView);
  }

  @Mutation(() => LeaveRequestView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveTeamRead)
  async submitLeaveRequest(
    @Args('input') input: SubmitLeaveRequestInput,
  ): Promise<LeaveRequestView> {
    const request = await this.leaveRequestService.submit({
      employeeId: toId<EmployeeId>(input.employeeId),
      leaveTypeId: toId<LeaveTypeId>(input.leaveTypeId),
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason ?? null,
      holidayCalendarId: input.holidayCalendarId
        ? toId<HolidayCalendarId>(input.holidayCalendarId)
        : null,
      requestedByUserId: input.requestedByUserId ? toId<UserId>(input.requestedByUserId) : null,
    });
    return toLeaveRequestView(request);
  }

  @Mutation(() => LeaveRequestView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveApprove)
  async approveLeaveRequest(
    @Args('input') input: DecideLeaveRequestInput,
  ): Promise<LeaveRequestView> {
    const request = await this.leaveRequestService.approve(
      input.leaveRequestId,
      toId<UserId>(input.decidedByUserId),
      input.note,
    );
    return toLeaveRequestView(request);
  }

  @Mutation(() => LeaveRequestView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveApprove)
  async rejectLeaveRequest(
    @Args('input') input: DecideLeaveRequestInput,
  ): Promise<LeaveRequestView> {
    const request = await this.leaveRequestService.reject(
      input.leaveRequestId,
      toId<UserId>(input.decidedByUserId),
      input.note,
    );
    return toLeaveRequestView(request);
  }

  @Mutation(() => LeaveRequestView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveApprove)
  async approveTeamLeaveRequest(
    @Args('input') input: ReviewLeaveRequestInput,
  ): Promise<LeaveRequestView> {
    const user = await this.authService.getCurrentUser();
    const request = await this.leaveRequestService.approve(
      input.leaveRequestId,
      toId<UserId>(user.id),
      input.note ?? undefined,
    );
    return toLeaveRequestView(request);
  }

  @Mutation(() => LeaveRequestView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveApprove)
  async rejectTeamLeaveRequest(
    @Args('input') input: ReviewLeaveRequestInput,
  ): Promise<LeaveRequestView> {
    const user = await this.authService.getCurrentUser();
    const request = await this.leaveRequestService.reject(
      input.leaveRequestId,
      toId<UserId>(user.id),
      input.note ?? undefined,
    );
    return toLeaveRequestView(request);
  }

  @Query(() => [LeaveBalanceView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveOwnRead)
  async myLeaveBalances(): Promise<LeaveBalanceView[]> {
    const user = await this.authService.getCurrentUser();
    if (!user.employeeId) {
      throw new NotFoundError('No employee record is linked to this account');
    }
    return (await this.leaveBalanceService.listForEmployee(user.employeeId)).map(
      toLeaveBalanceView,
    );
  }

  @Query(() => [LeaveRequestView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveOwnRead)
  async myLeaveRequests(): Promise<LeaveRequestView[]> {
    const user = await this.authService.getCurrentUser();
    if (!user.employeeId) {
      throw new NotFoundError('No employee record is linked to this account');
    }
    return (await this.leaveRequestService.listForEmployee(user.employeeId)).map(
      toLeaveRequestView,
    );
  }

  @Query(() => [HolidayView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.holidayRead)
  async upcomingHolidays(
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<HolidayView[]> {
    return (await this.holidayService.listUpcoming(from, to)).map(toHolidayView);
  }

  @Mutation(() => LeaveRequestView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.leaveOwnWrite)
  async submitMyLeaveRequest(
    @Args('input') input: SubmitMyLeaveRequestInput,
  ): Promise<LeaveRequestView> {
    const user = await this.authService.getCurrentUser();
    if (!user.employeeId) {
      throw new NotFoundError('No employee record is linked to this account');
    }
    const request = await this.leaveRequestService.submit({
      employeeId: user.employeeId,
      leaveTypeId: toId<LeaveTypeId>(input.leaveTypeId),
      startDate: input.startDate,
      endDate: input.endDate,
      reason: input.reason ?? null,
      holidayCalendarId: input.holidayCalendarId
        ? toId<HolidayCalendarId>(input.holidayCalendarId)
        : null,
      requestedByUserId: toId<UserId>(user.id),
    });
    return toLeaveRequestView(request);
  }
}
