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
exports.RoomImage = void 0;
const typeorm_1 = require("typeorm");
const Room_1 = require("./Room");
let RoomImage = class RoomImage {
};
exports.RoomImage = RoomImage;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoomImage.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar' }),
    __metadata("design:type", String)
], RoomImage.prototype, "imageUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RoomImage.prototype, "orderIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], RoomImage.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Room_1.Room, (room) => room.images, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'roomId' }),
    __metadata("design:type", Room_1.Room)
], RoomImage.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoomImage.prototype, "roomId", void 0);
exports.RoomImage = RoomImage = __decorate([
    (0, typeorm_1.Entity)('room_images')
], RoomImage);
//# sourceMappingURL=RoomImage.js.map