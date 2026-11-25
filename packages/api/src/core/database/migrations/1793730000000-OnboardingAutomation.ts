import type { MigrationInterface, QueryRunner } from 'typeorm';

// Onboarding automation (n8n): the per-person stage, the run history and the
// per-workspace webhook settings. Three new, additive tables owned by
// modules/onboarding-automation; no foreign keys (non-negotiable #2).
export class OnboardingAutomation1793730000000 implements MigrationInterface {
  name = 'OnboardingAutomation1793730000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "employee_onboarding_stages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organizationId" uuid NOT NULL, "employeeId" uuid NOT NULL, "stage" character varying(32) NOT NULL DEFAULT 'preOnboard', "documentsFolderUrl" text, "updatedByUserId" uuid, CONSTRAINT "PK_employee_onboarding_stages" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_employee_onboarding_stages_org" ON "employee_onboarding_stages" ("organizationId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_employee_onboarding_stages_org_employee" ON "employee_onboarding_stages" ("organizationId", "employeeId")`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "onboarding_automation_runs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organizationId" uuid NOT NULL, "employeeId" uuid NOT NULL, "stage" character varying(32) NOT NULL, "status" character varying(16) NOT NULL DEFAULT 'queued', "triggeredByUserId" uuid, "deliveredAt" TIMESTAMP WITH TIME ZONE, "completedAt" TIMESTAMP WITH TIME ZONE, "responseStatus" integer, "resultStage" character varying(32), "documentUrl" text, "message" text, CONSTRAINT "PK_onboarding_automation_runs" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_onboarding_automation_runs_org" ON "onboarding_automation_runs" ("organizationId")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_onboarding_automation_runs_org_employee_created" ON "onboarding_automation_runs" ("organizationId", "employeeId", "createdAt")`,
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "onboarding_automation_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "organizationId" uuid NOT NULL, "webhookUrl" text, "enabled" boolean NOT NULL DEFAULT false, "updatedByUserId" uuid, CONSTRAINT "PK_onboarding_automation_settings" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_onboarding_automation_settings_org" ON "onboarding_automation_settings" ("organizationId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_onboarding_automation_settings_org_unique" ON "onboarding_automation_settings" ("organizationId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "onboarding_automation_settings"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "onboarding_automation_runs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "employee_onboarding_stages"`);
  }
}
