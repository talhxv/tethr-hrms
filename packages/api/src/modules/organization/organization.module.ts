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
import { LOCATION_REPOSITORY, DEPARTMENT_REPOSITORY } from './organization.tokens';
import { LocationService } from './location.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Organization, LegalEntity, Location, Department, CostCenter]),
    AuthzModule,
  ],
  providers: [
    OrganizationService,
    OrganizationResolver,
    DepartmentService,
    LocationService,
    provideTenantScopedRepository(DEPARTMENT_REPOSITORY, Department),
    provideTenantScopedRepository(LOCATION_REPOSITORY, Location),
  ],
  exports: [OrganizationService, DepartmentService, LocationService],
})
export class OrganizationModule {}
