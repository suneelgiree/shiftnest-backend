"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomBooking = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Room_1 = require("./Room");
let RoomBooking = class RoomBooking {
};
exports.RoomBooking = RoomBooking;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoomBooking.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true }),
    __metadata("design:type", String)
], RoomBooking.prototype, "bookingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.roomBookings),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_1.User)
], RoomBooking.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoomBooking.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Room_1.Room, (room) => room.bookings),
    (0, typeorm_1.JoinColumn)({ name: 'roomId' }),
    __metadata("design:type", Room_1.Room)
], RoomBooking.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoomBooking.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'], default: 'PENDING' }),
    __metadata("design:type", String)
], RoomBooking.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: 500 }),
    __metadata("design:type", Number)
], RoomBooking.prototype, "bookingFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], RoomBooking.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RoomBooking.prototype, "bookingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RoomBooking.prototype, "confirmedAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RoomBooking.prototype, "updatedAt", void 0);
exports.RoomBooking = RoomBooking = __decorate([
    (0, typeorm_1.Entity)('room_bookings')
], RoomBooking);
//# sourceMappingURL=RoomBooking.js.map