import { Entity, Column } from 'typeorm';

import { BaseEntity } from '../../../core/database/entities/base.entity';

// The company Tethr provides HR services to — separate from Organization
// (the login tenant / "workspace"). Root-level, not tenant-scoped, same as
// Organization itself: a client exists before any workspace is created for
// it, and one client can have several workspaces (Organization.clientId is
// an ID-only reference back to this table — non-negotiable #2: no
// cross-module FKs). Only ever created/read by Tethr staff (client:manage).
@Entity('clients')
export class Client extends BaseEntity {
  @Column({ type: 'varchar', length: 256 })
  name!: string;
}
