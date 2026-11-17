import type { MigrationInterface, QueryRunner } from 'typeorm';

// National identity number (CNIC in Pakistan) on the employee's personal
// details, next to the passport fields. Additive and nullable.
export class EmployeeNationalId1793700000000 implements MigrationInterface {
  name = 'EmployeeNationalId1793700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "employee_personal_details" ADD COLUMN IF NOT EXISTS "nationalIdNumber" character varying(32)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "employee_personal_details" DROP COLUMN IF EXISTS "nationalIdNumber"`);
  }
}
