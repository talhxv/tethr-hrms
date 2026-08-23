import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthzModule } from '../../core/authz/authz.module';
import { OrganizationModule } from '../organization/organization.module';

import { ClientResolver } from './client.resolver';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client]), AuthzModule, OrganizationModule],
  providers: [ClientService, ClientResolver],
  exports: [ClientService],
})
export class ClientsModule {}
