import { toId, type EmployeeId, type OnboardingAutomationStage, type UserId } from '@hrms/shared';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthService } from '../../core/auth/auth.service';
import { PERMISSIONS } from '../../core/authz/permissions';
import { PermissionsGuard } from '../../core/authz/permissions.guard';
import { RequirePermissions } from '../../core/authz/require-permissions.decorator';

import {
  SetEmployeeOnboardingStageInput,
  UpdateOnboardingAutomationSettingsInput,
} from './dto/onboarding-automation.inputs';
import {
  EmployeeOnboardingStageView,
  OnboardingAutomationRunView,
  OnboardingAutomationSettingsView,
  toRunView,
  toSettingsView,
  toStageView,
} from './dto/onboarding-automation.outputs';
import { OnboardingAutomationService } from './onboarding-automation.service';

// Reads sit behind employee:sensitive:read, like the onboarding checklist they
// live next to; running and moving stages need employee:write. Wiring the
// workflow is a workspace setting (organization:manage).
@Resolver()
@UseGuards(PermissionsGuard)
export class OnboardingAutomationResolver {
  constructor(
    private readonly automation: OnboardingAutomationService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => EmployeeOnboardingStageView)
  @RequirePermissions(PERMISSIONS.employeeSensitiveRead)
  async employeeOnboardingStage(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<EmployeeOnboardingStageView> {
    return toStageView(await this.automation.getStage(toId<EmployeeId>(employeeId)));
  }

  @Query(() => [OnboardingAutomationRunView])
  @RequirePermissions(PERMISSIONS.employeeSensitiveRead)
  async onboardingAutomationRuns(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<OnboardingAutomationRunView[]> {
    const runs = await this.automation.listRuns(toId<EmployeeId>(employeeId));
    return runs.map(toRunView);
  }

  @Mutation(() => EmployeeOnboardingStageView)
  @RequirePermissions(PERMISSIONS.employeeWrite)
  async setEmployeeOnboardingStage(
    @Args('input') input: SetEmployeeOnboardingStageInput,
  ): Promise<EmployeeOnboardingStageView> {
    const user = await this.authService.getCurrentUser();
    return toStageView(
      await this.automation.setStage({
        employeeId: toId<EmployeeId>(input.employeeId),
        stage: input.stage as OnboardingAutomationStage,
        documentsFolderUrl: input.documentsFolderUrl,
        userId: toId<UserId>(user.id),
      }),
    );
  }

  @Mutation(() => OnboardingAutomationRunView)
  @RequirePermissions(PERMISSIONS.employeeWrite)
  async runOnboardingAutomation(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<OnboardingAutomationRunView> {
    const user = await this.authService.getCurrentUser();
    return toRunView(
      await this.automation.requestRun(toId<EmployeeId>(employeeId), toId<UserId>(user.id)),
    );
  }

  @Query(() => OnboardingAutomationSettingsView)
  @RequirePermissions(PERMISSIONS.organizationManage)
  async onboardingAutomationSettings(): Promise<OnboardingAutomationSettingsView> {
    return toSettingsView(await this.automation.getSettings());
  }

  @Mutation(() => OnboardingAutomationSettingsView)
  @RequirePermissions(PERMISSIONS.organizationManage)
  async updateOnboardingAutomationSettings(
    @Args('input') input: UpdateOnboardingAutomationSettingsInput,
  ): Promise<OnboardingAutomationSettingsView> {
    const user = await this.authService.getCurrentUser();
    return toSettingsView(
      await this.automation.updateSettings({
        webhookUrl: input.webhookUrl ?? null,
        enabled: input.enabled,
        userId: toId<UserId>(user.id),
      }),
    );
  }
}
