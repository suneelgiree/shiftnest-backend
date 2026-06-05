import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDriverApplications1762000000000 implements MigrationInterface {
  name = 'AddDriverApplications1762000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "driver_application_status_enum" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);
    await queryRunner.query(`
      CREATE TABLE "driver_applications" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL,
        "vehicleType" character varying NOT NULL,
        "plateNumber" character varying NOT NULL,
        "idCardPhotoUrl" character varying NOT NULL,
        "numberplatePhotoUrl" character varying NOT NULL,
        "status" "driver_application_status_enum" NOT NULL DEFAULT 'PENDING',
        "reviewNote" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_driver_applications" PRIMARY KEY ("id"),
        CONSTRAINT "FK_driver_app_user" FOREIGN KEY ("userId")
          REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "driver_applications"`);
    await queryRunner.query(`DROP TYPE "driver_application_status_enum"`);
  }
}
