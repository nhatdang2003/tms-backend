import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateDocument1760559128724 implements MigrationInterface {
    name = 'CreateDocument1760559128724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "document" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "created_by" integer, "updated_by" integer, "deleted_by" integer, "version" integer NOT NULL DEFAULT '1', "title" character varying NOT NULL, "description" character varying, "url" character varying, CONSTRAINT "UQ_39d28d83a120557f479cc0fd397" UNIQUE ("title"), CONSTRAINT "PK_e57d3357f83f3cdc0acffc3d777" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_39d28d83a120557f479cc0fd39" ON "document" ("title") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_39d28d83a120557f479cc0fd39"`);
        await queryRunner.query(`DROP TABLE "document"`);
    }

}
