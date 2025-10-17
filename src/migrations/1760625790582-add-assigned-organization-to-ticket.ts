import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssignedOrganizationToTicket1760625790582 implements MigrationInterface {
    name = 'AddAssignedOrganizationToTicket1760625790582'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" ADD "assigned_organization_id" integer`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_04cd65d65b06a1ad2a0aad152a4" FOREIGN KEY ("assigned_organization_id") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_04cd65d65b06a1ad2a0aad152a4"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "assigned_organization_id"`);
    }

}
