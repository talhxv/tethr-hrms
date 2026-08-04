import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AttendanceService } from './attendance.service';
import { ClockEventView } from './dto/clock-event.output';
import { OpenTimesheetInput } from './dto/open-timesheet.input';
import { RecordTimeEntryInput } from './dto/record-time-entry.input';
import { TimeEntryView } from './dto/time-entry.output';
import { TimesheetView } from './dto/timesheet.output';
import { ClockEvent } from './entities/clock-event.entity';
import { TimeEntry } from './entities/time-entry.entity';
import { Timesheet } from './entities/timesheet.entity';
import { TimesheetService } from './timesheet.service';

import { toId, type EmployeeId, type UserId } from '@hrms/shared';

const toClockEventView = (event: ClockEvent): ClockEventView => ({
  id: event.id,
  employeeId: event.employeeId,
  type: event.type,
  occurredAt: event.occurredAt.toISOString(),
  source: event.source,
});

const toTimeEntryView = (entry: TimeEntry): TimeEntryView => ({
  id: entry.id,
  employeeId: entry.employeeId,
  date: entry.date,
  hours: Number(entry.hours),
  source: entry.source,
});

const toTimesheetView = (timesheet: Timesheet): TimesheetView => ({
  id: timesheet.id,
  employeeId: timesheet.employeeId,
  periodStart: timesheet.periodStart,
  periodEnd: timesheet.periodEnd,
  status: timesheet.status,
  totalHours: Number(timesheet.totalHours),
});

@Resolver(() => TimesheetView)
export class AttendanceResolver {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly timesheetService: TimesheetService,
  ) {}

  @Mutation(() => ClockEventView)
  async clockIn(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<ClockEventView> {
    return toClockEventView(await this.attendanceService.clockIn(toId<EmployeeId>(employeeId)));
  }

  @Mutation(() => TimeEntryView)
  async clockOut(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<TimeEntryView> {
    return toTimeEntryView(await this.attendanceService.clockOut(toId<EmployeeId>(employeeId)));
  }

  @Mutation(() => TimeEntryView)
  async recordTimeEntry(@Args('input') input: RecordTimeEntryInput): Promise<TimeEntryView> {
    const entry = await this.attendanceService.recordEntry({
      employeeId: toId<EmployeeId>(input.employeeId),
      date: input.date,
      hours: input.hours,
      note: input.note ?? null,
    });
    return toTimeEntryView(entry);
  }

  @Query(() => [TimeEntryView])
  async timeEntries(
    @Args('employeeId', { type: () => ID }) employeeId: string,
    @Args('from') from: string,
    @Args('to') to: string,
  ): Promise<TimeEntryView[]> {
    const entries = await this.attendanceService.listEntries(toId<EmployeeId>(employeeId), from, to);
    return entries.map(toTimeEntryView);
  }

  @Query(() => [TimesheetView])
  async timesheets(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<TimesheetView[]> {
    const timesheets = await this.timesheetService.listForEmployee(toId<EmployeeId>(employeeId));
    return timesheets.map(toTimesheetView);
  }

  @Mutation(() => TimesheetView)
  async openTimesheet(@Args('input') input: OpenTimesheetInput): Promise<TimesheetView> {
    const timesheet = await this.timesheetService.open({
      employeeId: toId<EmployeeId>(input.employeeId),
      periodStart: input.periodStart,
      periodEnd: input.periodEnd,
    });
    return toTimesheetView(timesheet);
  }

  @Mutation(() => TimesheetView)
  async submitTimesheet(
    @Args('timesheetId', { type: () => ID }) timesheetId: string,
    @Args('submittedByUserId', { type: () => ID }) submittedByUserId: string,
  ): Promise<TimesheetView> {
    return toTimesheetView(
      await this.timesheetService.submit(timesheetId, toId<UserId>(submittedByUserId)),
    );
  }

  @Mutation(() => TimesheetView)
  async approveTimesheet(
    @Args('timesheetId', { type: () => ID }) timesheetId: string,
    @Args('approvedByUserId', { type: () => ID }) approvedByUserId: string,
  ): Promise<TimesheetView> {
    return toTimesheetView(
      await this.timesheetService.approve(timesheetId, toId<UserId>(approvedByUserId)),
    );
  }

  @Mutation(() => TimesheetView)
  async lockTimesheet(
    @Args('timesheetId', { type: () => ID }) timesheetId: string,
  ): Promise<TimesheetView> {
    return toTimesheetView(await this.timesheetService.lock(timesheetId));
  }
}
