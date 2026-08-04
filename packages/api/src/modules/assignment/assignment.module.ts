import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { provideTenantScopedRepository } from '../../core/tenancy/tenant-repository.provider';

import { AssignmentService } from './assignment.service';
import { ASSIGNMENT_REPOSITORY } from './assignment.tokens';
import { Assignment } from './entities/assignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Assignment])],
  providers: [AssignmentService, provideTenantScopedRepository(ASSIGNMENT_REPOSITORY, Assignment)],
  exports: [AssignmentService],
})
export class AssignmentModule {}
