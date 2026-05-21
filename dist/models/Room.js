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
exports.Room = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const RoomFacility_1 = require("./RoomFacility");
const RoomImage_1 = require("./RoomImage");
const RoomBooking_1 = require("./RoomBooking");
const SavedRoom_1 = require("./SavedRoom");
let Room = class Room {
};
exports.Room = Room;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Room.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Room.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Room.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], Room.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Room.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], Room.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Object)
], Room.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 6, nullable: true }),
    __metadata("design:type", Object)
], Room.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['1RK', '1BHK', '2BHK', 'FLAT'], default: '1BHK' }),
    __metadata("design:type", String)
], Room.prototype, "roomType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Room.prototype, "bedrooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], Room.prototype, "bathrooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Room.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Room.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.rooms),
    (0, typeorm_1.JoinColumn)({ name: 'ownerId' }),
    __metadata("design:type", User_1.User)
], Room.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Room.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RoomFacility_1.RoomFacility, (facility) => facility.room, { cascade: true }),
    __metadata("design:type", Array)
], Room.prototype, "facilities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RoomImage_1.RoomImage, (image) => image.room, { cascade: true }),
    __metadata("design:type", Array)
], Room.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RoomBooking_1.RoomBooking, (booking) => booking.room),
    __metadata("design:type", Array)
], Room.prototype, "bookings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => SavedRoom_1.SavedRoom, (saved) => saved.room),
    __metadata("design:type", Array)
], Room.prototype, "savedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Room.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Room.prototype, "updatedAt", void 0);
exports.Room = Room = __decorate([
    (0, typeorm_1.Entity)('rooms')
], Room);
//# sourceMappingURL=Room.js.map