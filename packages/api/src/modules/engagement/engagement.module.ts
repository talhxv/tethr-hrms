import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../../core/auth/auth.module';
import { AuthzModule } from '../../core/authz/authz.module';
import { provideTenantScopedRepository } from '../../core/tenancy/tenant-repository.provider';

import { EngagementResolver } from './engagement.resolver';
import { EngagementService } from './engagement.service';
import { ANNOUNCEMENT_REPOSITORY, EMPLOYEE_FEEDBACK_REPOSITORY } from './engagement.tokens';
import { Announcement } from './entities/announcement.entity';
import { EmployeeFeedback } from './entities/employee-feedback.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Announcement, EmployeeFeedback]), AuthModule, AuthzModule],
  providers: [
    EngagementService,
    EngagementResolver,
    provideTenantScopedRepository(ANNOUNCEMENT_REPOSITORY, Announcement),
    provideTenantScopedRepository(EMPLOYEE_FEEDBACK_REPOSITORY, EmployeeFeedback),
  ],
  exports: [EngagementService],
})
export class EngagementModule {}
