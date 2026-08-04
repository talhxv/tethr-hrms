import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../core/auth/auth.module';
import { AuthzModule } from '../../core/authz/authz.module';
import { provideTenantScopedRepository } from '../../core/tenancy/tenant-repository.provider';

import { EmployeeDirectoryService } from './employee-directory.service';
import { EmployeeResolver } from './employee.resolver';
import { EmployeeProfileService } from './employee-profile.service';
import { EmployeeService } from './employee.service';
import { EMPLOYEE_PROFILE_REPOSITORY, EMPLOYEE_REPOSITORY } from './employee.tokens';
import { Employee } from './entities/employee.entity';
import { EmployeeProfile } from './entities/employee-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Employee, EmployeeProfile]), AuthModule, AuthzModule],
  providers: [
    EmployeeService,
    EmployeeDirectoryService,
    EmployeeProfileService,
    EmployeeResolver,
    provideTenantScopedRepository(EMPLOYEE_REPOSITORY, Employee),
    provideTenantScopedRepository(EMPLOYEE_PROFILE_REPOSITORY, EmployeeProfile),
  ],
  exports: [EmployeeService, EmployeeDirectoryService, EmployeeProfileService],
})
export class EmployeeModule {}
