import { toId, type OrganizationId, type OrganizationKind } from '@hrms/shared';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { DomainEventPublisher } from '../../core/events/domain-event-publisher.service';
import { TenantContextService } from '../../core/tenancy/tenant-context.service';

import { Organization } from './entities/organization.entity';

export type CreateOrganizationInput = {
  readonly legalName: string;
  readonly kind?: OrganizationKind;
  readonly displayName?: string;
  readonly defaultLocale?: string;
  readonly defaultCurrency?: string;
};

@Injectable()
export class OrganizationService {
  constructor(
    @InjectRepository(Organization) private readonly organizations: Repository<Organization>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly publisher: DomainEventPublisher,
    private readonly tenantContext: TenantContextService,
  ) {}

  // Bootstrapping a tenant happens OUTSIDE any tenant scope (the tenant does not
  // exist yet). Create the org, then publish organization.created within the new
  // org's context, in the same transaction (transactional outbox).
  async create(input: CreateOrganizationInput): Promise<Organization> {
    return this.dataSource.transaction(async (manager) => {
      const organization = manager.create(Organization, {
        kind: input.kind ?? 'client',
        legalName: input.legalName,
        displayName: input.displayName ?? input.legalName,
        defaultLocale: input.defaultLocale ?? 'en',
        defaultCurrency: input.defaultCurrency ?? 'USD',
        settings: {},
      });
      const saved = await manager.save(organization);
      const organizationId = toId<OrganizationId>(saved.id);
      await this.tenantContext.run({ organizationId, userId: null }, () =>
        this.publisher.publishWithin(manager, {
          name: 'organization.created',
          payload: { organizationId, legalName: saved.legalName },
        }),
      );
      return saved;
    });
  }

  getById(id: OrganizationId): Promise<Organization | null> {
    return this.organizations.findOne({ where: { id } });
  }

  listClients(): Promise<Organization[]> {
    return this.organizations.find({ where: { kind: 'client' }, order: { createdAt: 'DESC' } });
  }
}
