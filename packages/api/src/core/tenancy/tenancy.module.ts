import { Global, Module } from '@nestjs/common';

import { TenantContextService } from './tenant-context.service';

// Global so any module's repository provider can inject TenantContextService.
@Global()
@Module({
  providers: [TenantContextService],
  exports: [TenantContextService],
})
export class TenancyModule {}
