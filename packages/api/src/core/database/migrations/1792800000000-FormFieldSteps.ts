import { MigrationInterface, QueryRunner } from "typeorm";

export class FormFieldSteps1792800000000 implements MigrationInterface {
    name = 'FormFieldSteps1792800000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Nullable on purpose: null keeps a field on the form's single page
        // (the application form is unaffected), a 1-based index moves it onto
        // that step of a multi-page form (the employee intake). No data change
        // — every existing row stays null.
        await queryRunner.query(`ALTER TABLE "form_fields" ADD "step" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "form_fields" DROP COLUMN "step"`);
    }

}
