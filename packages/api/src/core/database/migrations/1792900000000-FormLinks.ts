import { MigrationInterface, QueryRunner } from "typeorm";

export class FormLinks1792900000000 implements MigrationInterface {
    name = 'FormLinks1792900000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "form_links" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "organizationId" uuid NOT NULL,
                "slug" character varying(16) NOT NULL,
                "formDefinitionId" uuid NOT NULL,
                "refId" character varying(64),
                "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                CONSTRAINT "PK_form_links" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_form_links_slug" ON "form_links" ("slug")`);
        await queryRunner.query(`CREATE INDEX "IDX_form_links_organizationId" ON "form_links" ("organizationId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_form_links_organizationId"`);
        await queryRunner.query(`DROP INDEX "IDX_form_links_slug"`);
        await queryRunner.query(`DROP TABLE "form_links"`);
    }
}
