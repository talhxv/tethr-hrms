import type { DataClassification } from '@hrms/shared';
import { Column, Entity } from 'typeorm';

import { TenantScopedEntity } from '../database/entities/tenant-scoped.entity';

// Metadata for a stored file. The bytes live in object storage; this row holds
// the pointer (`storageKey`) and classification that drives access control and
// encryption (plan.md §6, "privacy & PII"). `sizeBytes` is bigint, surfaced as a
// string to avoid precision loss on large files.
@Entity('documents')
export class Document extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 256 })
  name!: string;

  @Column({ type: 'varchar', length: 128 })
  contentType!: string;

  @Column({ type: 'varchar', length: 512 })
  storageKey!: string;

  @Column({ type: 'bigint', default: 0 })
  sizeBytes!: string;

  @Column({ type: 'varchar', length: 16, default: 'internal' })
  classification!: DataClassification;
}
