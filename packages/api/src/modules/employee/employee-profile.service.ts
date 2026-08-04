import type { EmployeeId, UserId } from '@hrms/shared';
import { Inject, Injectable } from '@nestjs/common';
import type { FindOptionsWhere } from 'typeorm';

import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';
import { EmployeeProfile } from './entities/employee-profile.entity';
import { EMPLOYEE_PROFILE_REPOSITORY } from './employee.tokens';

export type UpdateEmployeeProfileData = {
  readonly photoUrl?: string | null;
  readonly personalEmail?: string | null;
  readonly phone?: string | null;
  readonly addressLine1?: string | null;
  readonly addressLine2?: string | null;
  readonly city?: string | null;
  readonly region?: string | null;
  readonly countryCode?: string | null;
  readonly postalCode?: string | null;
};

@Injectable()
export class EmployeeProfileService {
  constructor(
    @Inject(EMPLOYEE_PROFILE_REPOSITORY)
    private readonly profiles: TenantScopedRepository<EmployeeProfile>,
  ) {}

  getForEmployee(employeeId: EmployeeId): Promise<EmployeeProfile | null> {
    return this.profiles.findOne({ where: { employeeId } as FindOptionsWhere<EmployeeProfile> });
  }

  async updateForEmployee(
    employeeId: EmployeeId,
    updatedByUserId: UserId,
    input: UpdateEmployeeProfileData,
  ): Promise<EmployeeProfile> {
    const existing = await this.getForEmployee(employeeId);
    const profile =
      existing ??
      this.profiles.create({
        employeeId,
        photoUrl: null,
        personalEmail: null,
        phone: null,
        addressLine1: null,
        addressLine2: null,
        city: null,
        region: null,
        countryCode: null,
        postalCode: null,
        updatedByUserId,
      });

    Object.assign(profile, input, { updatedByUserId });
    return this.profiles.save(profile);
  }
}
