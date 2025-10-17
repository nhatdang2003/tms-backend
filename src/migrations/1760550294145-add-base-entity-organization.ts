import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBaseEntityOrganization1760550294145 implements MigrationInterface {
    name = 'AddBaseEntityOrganization1760550294145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "deleted_by" integer`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "version" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "deleted_by"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "organization" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "organization" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
