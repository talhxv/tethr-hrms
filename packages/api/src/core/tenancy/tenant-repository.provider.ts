import type { Provider } from '@nestjs/common';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource, type EntityTarget } from 'typeorm';

import type { TenantScopedEntity } from '../database/entities/tenant-scoped.entity';

import { TenantContextService } from './tenant-context.service';
import { TenantScopedRepository } from './tenant-scoped.repository';


// Builds a NestJS provider that yields a TenantScopedRepository for an entity.
// A module wires one with `provideTenantScopedRepository(EMPLOYEE_REPOSITORY,
// Employee)` and injects it by token — never the raw TypeORM repository.
export const provideTenantScopedRepository = <TEntity extends TenantScopedEntity>(
  token: string | symbol,
  entity: EntityTarget<TEntity>,
): Provider => ({
  provide: token,
  inject: [getDataSourceToken(), TenantContextService],
  useFactory: (dataSource: DataSource, tenantContext: TenantContextService) =>
    new TenantScopedRepository<TEntity>(dataSource.getRepository(entity), tenantContext),
});
