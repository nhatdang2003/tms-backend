import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTicketSchema1760623869000 implements MigrationInterface {
    name = 'CreateTicketSchema1760623869000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."tickets_status_enum" AS ENUM('NEW', 'ASSIGNED', 'OPEN', 'MOVING', 'PENDING', 'RESOLVED', 'COMPLETED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "tickets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying NOT NULL, "title" character varying NOT NULL, "description" text, "customerName" character varying NOT NULL, "customerPhone" character varying, "customerEmail" character varying, "customerAddress" character varying, "customerLat" double precision, "customerLng" double precision, "status" "public"."tickets_status_enum" NOT NULL DEFAULT 'NEW', "scheduledAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "assigned_technician_id" integer, "created_by_id" integer, "updated_by_id" integer, CONSTRAINT "PK_343bc942ae261cf7a1377f48fd0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_c6e20a830c0f8b571abd331b77" ON "tickets" ("code") `);
        await queryRunner.query(`CREATE TABLE "ticket_remind" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "remindAt" TIMESTAMP NOT NULL, "note" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ticket_id" uuid, "created_by_id" integer, CONSTRAINT "PK_1b8264615bbe5e0905c47592170" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."ticket_photo_type_enum" AS ENUM('BEFORE', 'AFTER')`);
        await queryRunner.query(`CREATE TABLE "ticket_photo" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."ticket_photo_type_enum" NOT NULL DEFAULT 'BEFORE', "url" character varying NOT NULL, "mime" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ticket_id" uuid, "uploaded_by_id" integer, CONSTRAINT "PK_2b02dc77b34706f2f0f37a60cee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7f88a8dfdad0f6cbf7c55d0cf5" ON "ticket_photo" ("type") `);
        await queryRunner.query(`CREATE TABLE "feedback_customer" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "comment" text, "channel" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ticket_id" uuid, CONSTRAINT "PK_a0bec92e744f506470240ac779c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ticket_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "data" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ticket_id" uuid, "actor_id" integer, CONSTRAINT "PK_6d0f4bc32cc3581d6a016bca30a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ticket_comment" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "ticket_id" uuid, "user_id" integer, CONSTRAINT "PK_375385ad29b177463987f0a14a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_a00e35f4202c6788f1960bcb698" FOREIGN KEY ("assigned_technician_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_f131b2269095005a89841a11e4a" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tickets" ADD CONSTRAINT "FK_6d0e4a691749d091c8684321ef5" FOREIGN KEY ("updated_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_remind" ADD CONSTRAINT "FK_e0f457347d7067f2ed468b1f0d4" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_remind" ADD CONSTRAINT "FK_ed59b328bea1516caa97906caec" FOREIGN KEY ("created_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_photo" ADD CONSTRAINT "FK_2a1d17c6a4c818a8b00861bf40b" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_photo" ADD CONSTRAINT "FK_c7dd2ceebad6d63160b47ebbdd6" FOREIGN KEY ("uploaded_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "feedback_customer" ADD CONSTRAINT "FK_914b972b3e68c9427e5348b5e8e" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_history" ADD CONSTRAINT "FK_369eedc575788b9f9e8667017b6" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_history" ADD CONSTRAINT "FK_91d41d745b4352da7914d64b9b2" FOREIGN KEY ("actor_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_comment" ADD CONSTRAINT "FK_8297608adb992a89a532f09405e" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ticket_comment" ADD CONSTRAINT "FK_c0e99b5c2daea330b6f0cfe04f5" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ticket_comment" DROP CONSTRAINT "FK_c0e99b5c2daea330b6f0cfe04f5"`);
        await queryRunner.query(`ALTER TABLE "ticket_comment" DROP CONSTRAINT "FK_8297608adb992a89a532f09405e"`);
        await queryRunner.query(`ALTER TABLE "ticket_history" DROP CONSTRAINT "FK_91d41d745b4352da7914d64b9b2"`);
        await queryRunner.query(`ALTER TABLE "ticket_history" DROP CONSTRAINT "FK_369eedc575788b9f9e8667017b6"`);
        await queryRunner.query(`ALTER TABLE "feedback_customer" DROP CONSTRAINT "FK_914b972b3e68c9427e5348b5e8e"`);
        await queryRunner.query(`ALTER TABLE "ticket_photo" DROP CONSTRAINT "FK_c7dd2ceebad6d63160b47ebbdd6"`);
        await queryRunner.query(`ALTER TABLE "ticket_photo" DROP CONSTRAINT "FK_2a1d17c6a4c818a8b00861bf40b"`);
        await queryRunner.query(`ALTER TABLE "ticket_remind" DROP CONSTRAINT "FK_ed59b328bea1516caa97906caec"`);
        await queryRunner.query(`ALTER TABLE "ticket_remind" DROP CONSTRAINT "FK_e0f457347d7067f2ed468b1f0d4"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_6d0e4a691749d091c8684321ef5"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_f131b2269095005a89841a11e4a"`);
        await queryRunner.query(`ALTER TABLE "tickets" DROP CONSTRAINT "FK_a00e35f4202c6788f1960bcb698"`);
        await queryRunner.query(`DROP TABLE "ticket_comment"`);
        await queryRunner.query(`DROP TABLE "ticket_history"`);
        await queryRunner.query(`DROP TABLE "feedback_customer"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7f88a8dfdad0f6cbf7c55d0cf5"`);
        await queryRunner.query(`DROP TABLE "ticket_photo"`);
        await queryRunner.query(`DROP TYPE "public"."ticket_photo_type_enum"`);
        await queryRunner.query(`DROP TABLE "ticket_remind"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c6e20a830c0f8b571abd331b77"`);
        await queryRunner.query(`DROP TABLE "tickets"`);
        await queryRunner.query(`DROP TYPE "public"."tickets_status_enum"`);
    }

}
