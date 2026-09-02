import { Inject, Injectable } from '@nestjs/common';

import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';

import { Location } from './entities/location.entity';
import { LOCATION_REPOSITORY } from './organization.tokens';

@Injectable()
export class LocationService {
  constructor(
    @Inject(LOCATION_REPOSITORY)
    private readonly locations: TenantScopedRepository<Location>,
  ) {}

  list(): Promise<Location[]> {
    return this.locations.find();
  }

  getById(id: string): Promise<Location | null> {
    return this.locations.findById(id);
  }
}
