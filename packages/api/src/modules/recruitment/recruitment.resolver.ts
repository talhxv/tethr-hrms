import { toId, type HiringRequestId, type HiringRequestStatus, type UserId } from '@hrms/shared';
import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthService } from '../../core/auth/auth.service';
import { PERMISSIONS } from '../../core/authz/permissions';
import { PermissionsGuard } from '../../core/authz/permissions.guard';
import { RequirePermissions } from '../../core/authz/require-permissions.decorator';

import { CreateHiringRequestInput } from './dto/create-hiring-request.input';
import { HiringRequestUpdateView } from './dto/hiring-request-update.output';
import { HiringRequestView } from './dto/hiring-request.output';
import { UpdateHiringRequestInput } from './dto/update-hiring-request.input';
import { HiringRequestUpdate } from './entities/hiring-request-update.entity';
import { HiringRequest } from './entities/hiring-request.entity';
import { RecruitmentService, type HiringRequestRecord } from './recruitment.service';

const toHiringRequestUpdateView = (update: HiringRequestUpdate): HiringRequestUpdateView => ({
  id: update.id,
  hiringRequestId: update.hiringRequestId,
  status: update.status,
  actor: update.actor,
  note: update.note,
  createdByUserId: update.createdByUserId,
  createdAt: update.createdAt.toISOString(),
});

const toHiringRequestView = (
  request: HiringRequest,
  updates: readonly HiringRequestUpdate[] = [],
): HiringRequestView => ({
  id: request.id,
  positionTitle: request.positionTitle,
  headcount: request.headcount,
  employmentType: request.employmentType,
  location: request.location,
  preferredStartDate: request.preferredStartDate,
  clientNote: request.clientNote,
  tethrNote: request.tethrNote,
  status: request.status,
  createdAt: request.createdAt.toISOString(),
  updatedAt: request.updatedAt.toISOString(),
  updates: updates.map(toHiringRequestUpdateView),
});

const toHiringRequestRecordView = (record: HiringRequestRecord): HiringRequestView => ({
  ...toHiringRequestView(record.request, record.updates),
});

@Resolver(() => HiringRequestView)
export class RecruitmentResolver {
  constructor(
    private readonly recruitmentService: RecruitmentService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => [HiringRequestView])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.hiringRequestRead)
  async hiringRequests(): Promise<HiringRequestView[]> {
    return (await this.recruitmentService.listHiringRequests()).map(toHiringRequestRecordView);
  }

  @Mutation(() => HiringRequestView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.hiringRequestWrite)
  async createHiringRequest(
    @Args('input') input: CreateHiringRequestInput,
  ): Promise<HiringRequestView> {
    const user = await this.authService.getCurrentUser();
    const request = await this.recruitmentService.createHiringRequest({
      positionTitle: input.positionTitle,
      headcount: input.headcount,
      employmentType: input.employmentType,
      location: input.location ?? null,
      preferredStartDate: input.preferredStartDate ?? null,
      clientNote: input.clientNote ?? null,
      requestedByUserId: toId<UserId>(user.id),
    });
    return toHiringRequestView(request);
  }

  @Mutation(() => HiringRequestView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.hiringRequestManage)
  async updateHiringRequest(
    @Args('input') input: UpdateHiringRequestInput,
  ): Promise<HiringRequestView> {
    const user = await this.authService.getCurrentUser();
    const request = await this.recruitmentService.updateHiringRequest({
      hiringRequestId: toId<HiringRequestId>(input.hiringRequestId),
      status: input.status as HiringRequestStatus,
      tethrNote: input.tethrNote,
      updatedByUserId: toId<UserId>(user.id),
    });
    return toHiringRequestView(request);
  }
}
