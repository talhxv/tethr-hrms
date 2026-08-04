import type { DepartmentId, GradeId, JobId, LocationId } from '@hrms/shared';
import { Inject, Injectable } from '@nestjs/common';

import { NotFoundError } from '../../common/errors';
import { TenantScopedRepository } from '../../core/tenancy/tenant-scoped.repository';

import { Position } from './entities/position.entity';
import { POSITION_REPOSITORY } from './position.tokens';


export type CreatePositionInput = {
  readonly title: string;
  readonly jobId: JobId;
  readonly departmentId?: DepartmentId | null;
  readonly locationId?: LocationId | null;
  readonly gradeId?: GradeId | null;
  readonly headcount?: number;
};

@Injectable()
export class PositionService {
  constructor(
    @Inject(POSITION_REPOSITORY) private readonly positions: TenantScopedRepository<Position>,
  ) {}

  create(input: CreatePositionInput): Promise<Position> {
    const position = this.positions.create({
      title: input.title,
      jobId: input.jobId,
      departmentId: input.departmentId ?? null,
      locationId: input.locationId ?? null,
      gradeId: input.gradeId ?? null,
      status: 'open',
      headcount: input.headcount ?? 1,
    });
    return this.positions.save(position);
  }

  list(): Promise<Position[]> {
    return this.positions.find();
  }

  async getById(id: string): Promise<Position> {
    const position = await this.positions.findById(id);
    if (!position) {
      throw new NotFoundError('Position not found', { id });
    }
    return position;
  }
}
