import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { provideTenantScopedRepository } from '../tenancy/tenant-repository.provider';

import { ApprovalRequest } from './approval-request.entity';
import { WorkflowService } from './workflow.service';
import { APPROVAL_REQUEST_REPOSITORY } from './workflow.tokens';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([ApprovalRequest])],
  providers: [
    WorkflowService,
    provideTenantScopedRepository(APPROVAL_REQUEST_REPOSITORY, ApprovalRequest),
  ],
  exports: [WorkflowService],
})
export class WorkflowModule {}
