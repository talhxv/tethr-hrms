import type {
  DocumentId,
  EmployeeDocumentCategory,
  EmployeeDocumentVisibility,
  EmployeeId,
  UserId,
} from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

@Entity('employee_document_links')
@Index(['organizationId', 'employeeId'])
@Index(['organizationId', 'visibility'])
export class EmployeeDocumentLink extends TenantScopedEntity {
  @Column({ type: 'uuid' })
  employeeId!: EmployeeId;

  @Column({ type: 'uuid' })
  documentId!: DocumentId;

  @Column({ type: 'varchar', length: 24 })
  category!: EmployeeDocumentCategory;

  @Column({ type: 'varchar', length: 16, default: 'tethr' })
  visibility!: EmployeeDocumentVisibility;

  @Column({ type: 'uuid' })
  attachedByUserId!: UserId;
}
