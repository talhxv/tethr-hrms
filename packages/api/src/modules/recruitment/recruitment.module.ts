import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../core/auth/auth.module';
import { AuthzModule } from '../../core/authz/authz.module';
import { provideTenantScopedRepository } from '../../core/tenancy/tenant-repository.provider';

import { HiringRequestUpdate } from './entities/hiring-request-update.entity';
import { HiringRequest } from './entities/hiring-request.entity';
import { RecruitmentResolver } from './recruitment.resolver';
import { RecruitmentService } from './recruitment.service';
import { HIRING_REQUEST_REPOSITORY, HIRING_REQUEST_UPDATE_REPOSITORY } from './recruitment.tokens';

@Module({
  imports: [
    TypeOrmModule.forFeature([HiringRequest, HiringRequestUpdate]),
    AuthModule,
    AuthzModule,
  ],
  providers: [
    RecruitmentService,
    RecruitmentResolver,
    provideTenantScopedRepository(HIRING_REQUEST_REPOSITORY, HiringRequest),
    provideTenantScopedRepository(HIRING_REQUEST_UPDATE_REPOSITORY, HiringRequestUpdate),
  ],
  exports: [RecruitmentService],
})
export class RecruitmentModule {}
