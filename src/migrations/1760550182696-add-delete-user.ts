import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDeleteUser1760550182696 implements MigrationInterface {
    name = 'AddDeleteUser1760550182696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "user" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updated_by" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "deleted_by" integer`);
        await queryRunner.query(`ALTER TABLE "user" ADD "version" integer NOT NULL DEFAULT '1'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_by"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

}
