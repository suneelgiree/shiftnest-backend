"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRoomTables1705000000000 = void 0;
class CreateRoomTables1705000000000 {
    async up(queryRunner) {
        // Create enum types
        await queryRunner.query(`CREATE TYPE "room_type_enum" AS ENUM ('1RK', '1BHK', '2BHK', 'FLAT')`);
        await queryRunner.query(`CREATE TYPE "booking_status_enum" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "facility_enum" AS ENUM ('WIFI', 'KITCHEN', 'PARKING', 'BATHROOM', 'FURNISHED', 'WATER_24_7', 'BALCONY', 'AC', 'HEATING')`);
        // Create rooms table
        await queryRunner.query(`CREATE TABLE "rooms" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "title" varchar NOT NULL, "description" text NOT NULL, "price" numeric(10, 2) NOT NULL, "location" varchar NOT NULL, "city" varchar NOT NULL, "latitude" numeric(10, 6), "longitude" numeric(10, 6), "roomType" "room_type_enum" NOT NULL DEFAULT '1BHK', "bedrooms" int NOT NULL DEFAULT 1, "bathrooms" int NOT NULL DEFAULT 1, "isVerified" boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true, "ownerId" uuid NOT NULL, "createdAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "fk_rooms_owner" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE)`);
        await queryRunner.query(`CREATE INDEX "idx_rooms_ownerId" ON "rooms" ("ownerId")`);
        await queryRunner.query(`CREATE INDEX "idx_rooms_location" ON "rooms" ("location")`);
        await queryRunner.query(`CREATE INDEX "idx_rooms_city" ON "rooms" ("city")`);
        // Create room_facilities table
        await queryRunner.query(`CREATE TABLE "room_facilities" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "facility" "facility_enum" NOT NULL, "roomId" uuid NOT NULL, CONSTRAINT "fk_room_facilities_room" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE)`);
        await queryRunner.query(`CREATE INDEX "idx_room_facilities_roomId" ON "room_facilities" ("roomId")`);
        // Create room_images table
        await queryRunner.query(`CREATE TABLE "room_images" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "imageUrl" varchar NOT NULL, "orderIndex" int NOT NULL DEFAULT 0, "isPrimary" boolean NOT NULL DEFAULT false, "roomId" uuid NOT NULL, CONSTRAINT "fk_room_images_room" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE)`);
        await queryRunner.query(`CREATE INDEX "idx_room_images_roomId" ON "room_images" ("roomId")`);
        // Create room_bookings table
        await queryRunner.query(`CREATE TABLE "room_bookings" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "bookingId" varchar NOT NULL UNIQUE, "userId" uuid NOT NULL, "roomId" uuid NOT NULL, "status" "booking_status_enum" NOT NULL DEFAULT 'PENDING', "bookingFee" numeric(10, 2) NOT NULL DEFAULT 500, "notes" varchar, "bookingDate" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, "confirmedAt" timestamp, "updatedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "fk_room_bookings_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE, CONSTRAINT "fk_room_bookings_room" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE)`);
        await queryRunner.query(`CREATE INDEX "idx_room_bookings_userId" ON "room_bookings" ("userId")`);
        await queryRunner.query(`CREATE INDEX "idx_room_bookings_roomId" ON "room_bookings" ("roomId")`);
        // Create saved_rooms table
        await queryRunner.query(`CREATE TABLE "saved_rooms" ("id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "userId" uuid NOT NULL, "roomId" uuid NOT NULL, "savedAt" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "fk_saved_rooms_user" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE, CONSTRAINT "fk_saved_rooms_room" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE, CONSTRAINT "uq_saved_rooms_user_room" UNIQUE ("userId", "roomId"))`);
        await queryRunner.query(`CREATE INDEX "idx_saved_rooms_userId" ON "saved_rooms" ("userId")`);
        await queryRunner.query(`CREATE INDEX "idx_saved_rooms_roomId" ON "saved_rooms" ("roomId")`);
    }
    async down(queryRunner) {
        await queryRunner.query('DROP TABLE IF EXISTS "saved_rooms"');
        await queryRunner.query('DROP TABLE IF EXISTS "room_bookings"');
        await queryRunner.query('DROP TABLE IF EXISTS "room_images"');
        await queryRunner.query('DROP TABLE IF EXISTS "room_facilities"');
        await queryRunner.query('DROP TABLE IF EXISTS "rooms"');
        await queryRunner.query('DROP TYPE IF EXISTS "room_type_enum"');
        await queryRunner.query('DROP TYPE IF EXISTS "booking_status_enum"');
        await queryRunner.query('DROP TYPE IF EXISTS "facility_enum"');
    }
}
exports.CreateRoomTables1705000000000 = CreateRoomTables1705000000000;
//# sourceMappingURL=1705000000000-CreateRoomTables.js.map