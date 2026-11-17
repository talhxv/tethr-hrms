import type { MigrationInterface, QueryRunner } from 'typeorm';

// Roles are tenant data seeded from SYSTEM_ROLES, so existing roles do not pick
// up permission changes. Mirror the 16 Nov 2026 access decisions
// (core/authz/system-roles.ts):
//  - tethrHr, tethrFinance: + the employee's own-record (self-service) set
//  - tethrHr: + user:manage (limited to Employee logins in authz.service.ts)
//  - clientMember: - compensation:read (salaries visible to client admins only)
const SELF_SERVICE = [
  'employee:self:read',
  'employee:self:write',
  'compensation:own:read',
  'payslip:own:read',
  'leave:own:read',
  'leave:own:write',
  'attendance:own:read',
  'attendance:own:write',
  'holiday:read',
  'announcement:read',
  'feedback:write',
  'expense:own:read',
  'expense:own:write',
  'hardware-request:own:read',
  'hardware-request:own:write',
];

const addPermissions = (roleKey: string, permissions: readonly string[]): string =>
  `UPDATE "roles" SET "permissions" = (
     SELECT jsonb_agg(DISTINCT value ORDER BY value)
       FROM jsonb_array_elements_text("permissions" || '${JSON.stringify(permissions)}'::jsonb)
   ) WHERE "key" = '${roleKey}'`;

export class RoleAccessAdjustments1793720000000 implements MigrationInterface {
  name = 'RoleAccessAdjustments1793720000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(addPermissions('tethrHr', [...SELF_SERVICE, 'user:manage']));
    await queryRunner.query(addPermissions('tethrFinance', SELF_SERVICE));
    await queryRunner.query(
      `UPDATE "roles" SET "permissions" = "permissions" - 'compensation:read' WHERE "key" = 'clientMember'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const permission of [...SELF_SERVICE, 'user:manage']) {
      await queryRunner.query(
        `UPDATE "roles" SET "permissions" = "permissions" - '${permission}' WHERE "key" = 'tethrHr'`,
      );
    }
    for (const permission of SELF_SERVICE) {
      await queryRunner.query(
        `UPDATE "roles" SET "permissions" = "permissions" - '${permission}' WHERE "key" = 'tethrFinance'`,
      );
    }
    await queryRunner.query(
      `UPDATE "roles" SET "permissions" = "permissions" || '["compensation:read"]'::jsonb WHERE "key" = 'clientMember' AND NOT "permissions" ? 'compensation:read'`,
    );
  }
}
