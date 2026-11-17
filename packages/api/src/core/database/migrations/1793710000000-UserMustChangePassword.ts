import type { MigrationInterface, QueryRunner } from 'typeorm';

// Forced password change after an administrator chose the password (a login
// created for someone, or a reset). Existing logins are unaffected.
export class UserMustChangePassword1793710000000 implements MigrationInterface {
  name = 'UserMustChangePassword1793710000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "mustChangePassword" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "mustChangePassword"`);
  }
}
