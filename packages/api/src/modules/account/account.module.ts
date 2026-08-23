import { Module } from '@nestjs/common';

import { AuthModule } from '../../core/auth/auth.module';
import { AuthzModule } from '../../core/authz/authz.module';
import { ClientsModule } from '../clients/clients.module';
import { OrganizationModule } from '../organization/organization.module';

import { AccountResolver } from './account.resolver';
import { AccountService } from './account.service';

// Composes Auth (core) + Organization + Clients (modules) for tenant signup
// and client onboarding. modules -> core and modules -> modules (via
// published services) are both allowed.
@Module({
  imports: [AuthModule, AuthzModule, OrganizationModule, ClientsModule],
  providers: [AccountService, AccountResolver],
  exports: [AccountService],
})
export class AccountModule {}
