import type { EmployeeId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../database/entities/tenant-scoped.entity';


export type UserStatus = 'invited' | 'active' | 'disabled';

// A login identity — NOT an HR record (non-negotiable #6). The link to an
// employee is optional and by ID only (non-negotiable #2: no cross-module FK):
//  - null for users who are not employees (external recruiters, auditors)
//  - null for employees with no login (deskless / frontline workers)
//  - rehires reuse the login or not, independently of the employment record
@Entity('users')
@Index(['organizationId', 'email'], { unique: true })
export class User extends TenantScopedEntity {
  @Column({ type: 'varchar', length: 320 })
  email!: string;

  @Column({ type: 'varchar', length: 200 })
  passwordHash!: string;

  @Column({ type: 'varchar', length: 16, default: 'invited' })
  status!: UserStatus;

  @Column({ type: 'boolean', default: false })
  mfaEnabled!: boolean;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  employeeId!: EmployeeId | null;
}
