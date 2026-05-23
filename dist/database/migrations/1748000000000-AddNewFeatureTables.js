"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddNewFeatureTables1748000000000 = void 0;
class AddNewFeatureTables1748000000000 {
    constructor() {
        this.name = 'AddNewFeatureTables1748000000000';
    }
    async up(queryRunner) {
        await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "avatarUrl" varchar
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "vehicles" (
        "id"          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "vehicleType" varchar NOT NULL UNIQUE,
        "displayName" varchar NOT NULL,
        "baseFare"    numeric(10,2) NOT NULL,
        "helperRate"  numeric(10,2) NOT NULL DEFAULT 800,
        "serviceFee"  numeric(10,2) NOT NULL DEFAULT 300,
        "description" varchar,
        "isActive"    boolean NOT NULL DEFAULT true
      )
    `);
        await queryRunner.query(`
      INSERT INTO "vehicles" ("vehicleType","displayName","baseFare","helperRate","serviceFee","description")
      VALUES
        ('PICKUP',   'Pickup',       2500, 800, 300, 'Small pickup, ideal for single-room moves'),
        ('TATA_ACE', 'Tata Ace',     3500, 800, 300, 'Medium truck, 1-2 rooms'),
        ('TRUCK',    'Truck (17ft)', 6000, 800, 300, 'Full household moves')
      ON CONFLICT ("vehicleType") DO NOTHING
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "drivers" (
        "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId"       uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "vehicleId"    uuid NOT NULL REFERENCES "vehicles"("id"),
        "plateNumber"  varchar,
        "rating"       numeric(3,2) NOT NULL DEFAULT 5.0,
        "totalRatings" int NOT NULL DEFAULT 0,
        "isAvailable"  boolean NOT NULL DEFAULT true,
        "currentLat"   numeric(10,6),
        "currentLng"   numeric(10,6),
        "createdAt"    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "shift_bookings" (
        "id"           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "bookingId"    varchar NOT NULL UNIQUE,
        "userId"       uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "driverId"     uuid REFERENCES "drivers"("id"),
        "vehicleId"    uuid NOT NULL REFERENCES "vehicles"("id"),
        "fromLocation" varchar NOT NULL,
        "toLocation"   varchar NOT NULL,
        "moveDate"     date NOT NULL,
        "helpers"      int NOT NULL DEFAULT 0,
        "baseFare"     numeric(10,2) NOT NULL,
        "helpersCost"  numeric(10,2) NOT NULL DEFAULT 0,
        "serviceFee"   numeric(10,2) NOT NULL DEFAULT 300,
        "totalFare"    numeric(10,2) NOT NULL,
        "status"       varchar NOT NULL DEFAULT 'PENDING',
        "notes"        varchar,
        "createdAt"    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id"              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId"          uuid NOT NULL REFERENCES "users"("id"),
        "bookingRef"      varchar NOT NULL,
        "bookingType"     varchar NOT NULL,
        "amount"          numeric(10,2) NOT NULL,
        "method"          varchar NOT NULL,
        "status"          varchar NOT NULL DEFAULT 'PENDING',
        "gatewayRef"      varchar,
        "gatewayResponse" jsonb,
        "createdAt"       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"       timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
        await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "reviews" (
        "id"         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "reviewerId" uuid NOT NULL REFERENCES "users"("id"),
        "targetType" varchar NOT NULL,
        "targetId"   uuid NOT NULL,
        "rating"     int NOT NULL CHECK (rating BETWEEN 1 AND 5),
        "comment"    text,
        "bookingRef" varchar NOT NULL UNIQUE,
        "createdAt"  timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "reviews"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "shift_bookings"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "drivers"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "vehicles"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "avatarUrl"`);
    }
}
exports.AddNewFeatureTables1748000000000 = AddNewFeatureTables1748000000000;
//# sourceMappingURL=1748000000000-AddNewFeatureTables.js.map