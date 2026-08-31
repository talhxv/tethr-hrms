import { toId, type EmployeeId, type UserId, type WorkerType } from '@hrms/shared';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';

import { NotFoundError } from '../../common/errors';
import { AuthService } from '../../core/auth/auth.service';
import { PERMISSIONS } from '../../core/authz/permissions';
import { PermissionsGuard } from '../../core/authz/permissions.guard';
import { RequirePermissions } from '../../core/authz/require-permissions.decorator';

import { CreateEmployeeInput } from './dto/create-employee.input';
import { EmployeeProfileView } from './dto/employee-profile.output';
import { EmployeeType } from './dto/employee.output';
import { TerminateEmployeeInput } from './dto/terminate-employee.input';
import { UpdateEmployeePhotoInput } from './dto/update-employee-photo.input';
import { UpdateMyPhotoInput } from './dto/update-my-photo.input';
import { UpdateMyProfileInput } from './dto/update-my-profile.input';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeService } from './employee.service';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { Employee } from './entities/employee.entity';

// Maps the entity to the GraphQL boundary type. The resolver knows both sides;
// the service and DTOs do not (architecture.md §2.3).
const toEmployeeType = (employee: Employee): EmployeeType => ({
  id: employee.id,
  employeeNumber: employee.employeeNumber,
  firstName: employee.firstName,
  lastName: employee.lastName,
  workEmail: employee.workEmail,
  roleTitle: employee.roleTitle,
  dateOfBirth: employee.dateOfBirth,
  probationEndDate: employee.probationEndDate,
  hireDate: employee.hireDate,
  terminationDate: employee.terminationDate,
  employmentStatus: employee.employmentStatus,
  workerType: employee.workerType,
});

const toEmployeeProfileView = (profile: EmployeeProfile): EmployeeProfileView => ({
  employeeId: profile.employeeId,
  photoUrl: profile.photoUrl,
  personalEmail: profile.personalEmail,
  phone: profile.phone,
  addressLine1: profile.addressLine1,
  addressLine2: profile.addressLine2,
  city: profile.city,
  region: profile.region,
  countryCode: profile.countryCode,
  postalCode: profile.postalCode,
});

@Resolver(() => EmployeeType)
export class EmployeeResolver {
  constructor(
    private readonly employeeService: EmployeeService,
    private readonly profileService: EmployeeProfileService,
    private readonly authService: AuthService,
  ) {}

  @Query(() => [EmployeeType])
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeRead)
  async employees(): Promise<EmployeeType[]> {
    const employees = await this.employeeService.list();
    return employees.map(toEmployeeType);
  }

  @Query(() => EmployeeType)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeRead)
  async employee(@Args('id', { type: () => ID }) id: string): Promise<EmployeeType> {
    return toEmployeeType(await this.employeeService.getById(id));
  }

  @Mutation(() => EmployeeType)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeWrite)
  async createEmployee(@Args('input') input: CreateEmployeeInput): Promise<EmployeeType> {
    const employee = await this.employeeService.create({
      employeeNumber: input.employeeNumber,
      firstName: input.firstName,
      lastName: input.lastName,
      workEmail: input.workEmail ?? null,
      roleTitle: input.roleTitle ?? null,
      dateOfBirth: input.dateOfBirth ?? null,
      hireDate: input.hireDate,
      probationEndDate: input.probationEndDate ?? null,
      workerType: (input.workerType as WorkerType | undefined) ?? 'permanent',
    });
    return toEmployeeType(employee);
  }

  @Mutation(() => EmployeeType)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeWrite)
  async terminateEmployee(@Args('input') input: TerminateEmployeeInput): Promise<EmployeeType> {
    const employee = await this.employeeService.terminate(
      input.employeeId,
      input.effectiveDate,
      input.reason,
    );
    return toEmployeeType(employee);
  }

  @Query(() => EmployeeType)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeSelfRead)
  async myEmployee(): Promise<EmployeeType> {
    const user = await this.authService.getCurrentUser();
    if (!user.employeeId) {
      throw new NotFoundError('No employee record is linked to this account');
    }
    return toEmployeeType(await this.employeeService.getById(user.employeeId));
  }

  @Query(() => EmployeeProfileView, { nullable: true })
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeRead)
  async employeeProfile(
    @Args('employeeId', { type: () => ID }) employeeId: string,
  ): Promise<EmployeeProfileView | null> {
    const profile = await this.profileService.getForEmployee(toId<EmployeeId>(employeeId));
    return profile ? toEmployeeProfileView(profile) : null;
  }

  @Query(() => EmployeeProfileView, { nullable: true })
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeSelfRead)
  async myEmployeeProfile(): Promise<EmployeeProfileView | null> {
    const user = await this.authService.getCurrentUser();
    if (!user.employeeId) {
      throw new NotFoundError('No employee record is linked to this account');
    }
    const profile = await this.profileService.getForEmployee(user.employeeId);
    return profile ? toEmployeeProfileView(profile) : null;
  }

  @Mutation(() => EmployeeProfileView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeWrite)
  async updateEmployeePhoto(
    @Args('input') input: UpdateEmployeePhotoInput,
  ): Promise<EmployeeProfileView> {
    const user = await this.authService.getCurrentUser();
    const profile = await this.profileService.updateForEmployee(
      toId<EmployeeId>(input.employeeId),
      toId<UserId>(user.id),
      { photoUrl: input.photoUrl ?? null },
    );
    return toEmployeeProfileView(profile);
  }

  @Mutation(() => EmployeeProfileView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeSelfWrite)
  async updateMyEmployeeProfile(
    @Args('input') input: UpdateMyProfileInput,
  ): Promise<EmployeeProfileView> {
    const user = await this.authService.getCurrentUser();
    if (!user.employeeId) {
      throw new NotFoundError('No employee record is linked to this account');
    }
    return toEmployeeProfileView(
      await this.profileService.updateForEmployee(user.employeeId, toId<UserId>(user.id), input),
    );
  }

  // Employees set their own photo the same way admins do (a data URL from a
  // picked file), separate from the text profile form.
  @Mutation(() => EmployeeProfileView)
  @UseGuards(PermissionsGuard)
  @RequirePermissions(PERMISSIONS.employeeSelfWrite)
  async updateMyEmployeePhoto(
    @Args('input') input: UpdateMyPhotoInput,
  ): Promise<EmployeeProfileView> {
    const user = await this.authService.getCurrentUser();
    if (!user.employeeId) {
      throw new NotFoundError('No employee record is linked to this account');
    }
    return toEmployeeProfileView(
      await this.profileService.updateForEmployee(user.employeeId, toId<UserId>(user.id), {
        photoUrl: input.photoUrl ?? null,
      }),
    );
  }
}
