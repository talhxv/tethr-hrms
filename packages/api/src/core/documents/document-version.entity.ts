import type { DocumentId, DocumentSignatureStatus, UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../database/entities/tenant-scoped.entity';

@Entity('document_versions')
@Index(['organizationId', 'documentId', 'versionNumber'], { unique: true })
export class DocumentVersion extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  documentId!: DocumentId;

  @Column({ type: 'integer' })
  versionNumber!: number;

  @Column({ type: 'varchar', length: 512 })
  storageKey!: string;

  @Column({ type: 'varchar', length: 128 })
  contentType!: string;

  @Column({ type: 'bigint', default: 0 })
  sizeBytes!: string;

  @Column({ type: 'varchar', length: 24, default: 'notRequired' })
  signatureStatus!: DocumentSignatureStatus;

  @Column({ type: 'timestamptz', nullable: true })
  signedAt!: Date | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  signatureProvider!: string | null;

  @Column({ type: 'varchar', length: 160, nullable: true })
  externalEnvelopeId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  createdByUserId!: UserId | null;
}
