import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthzModule } from '../../core/authz/authz.module';
import { provideTenantScopedRepository } from '../../core/tenancy/tenant-repository.provider';

import { DepartmentService } from './department.service';
import { CostCenter } from './entities/cost-center.entity';
import { Department } from './entities/department.entity';
import { LegalEntity } from './entities/legal-entity.entity';
import { Location } from './entities/location.entity';
import { Organization } from './entities/organization.entity';
import { OrganizationResolver } from './organization.resolver';
import { OrganizationService } from './organization.service';
import { DEPARTMENT_REPOSITORY } from './organization.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, LegalEntity, Location, Department, CostCenter]),
    AuthzModule,
  ],
  providers: [
    OrganizationService,
    OrganizationResolver,
    DepartmentService,
    provideTenantScopedRepository(DEPARTMENT_REPOSITORY, Department),
  ],
  exports: [OrganizationService, DepartmentService],
})
export class OrganizationModule {}
