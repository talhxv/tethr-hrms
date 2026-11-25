import type { UserId } from '@hrms/shared';
import { Column, Entity, Index } from 'typeorm';

import { TenantScopedEntity } from '../../../core/database/entities/tenant-scoped.entity';

// Per-workspace wiring to the external workflow — configuration as data
// (non-negotiable #5). The shared secret is deliberately NOT stored here: it
// lives in the server environment so it never reaches the browser or the DB.
@Entity('onboarding_automation_settings')
@Index(['organizationId'], { unique: true })
export class OnboardingAutomationSettings extends TenantScopedEntity {
  // The workflow's production webhook URL (n8n "Webhook" trigger node).
  @Column({ type: 'text', nullable: true })
  webhookUrl!: string | null;

  @Column({ type: 'boolean', default: false })
  enabled!: boolean;

  @Column({ type: 'uuid', nullable: true })
  updatedByUserId!: UserId | null;
}
