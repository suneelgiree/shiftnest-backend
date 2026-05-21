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
exports.RoomFacility = void 0;
const typeorm_1 = require("typeorm");
const Room_1 = require("./Room");
let RoomFacility = class RoomFacility {
};
exports.RoomFacility = RoomFacility;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoomFacility.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: ['WIFI', 'KITCHEN', 'PARKING', 'BATHROOM', 'FURNISHED', 'WATER_24_7', 'BALCONY', 'AC', 'HEATING'] }),
    __metadata("design:type", String)
], RoomFacility.prototype, "facility", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Room_1.Room, (room) => room.facilities, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'roomId' }),
    __metadata("design:type", Room_1.Room)
], RoomFacility.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoomFacility.prototype, "roomId", void 0);
exports.RoomFacility = RoomFacility = __decorate([
    (0, typeorm_1.Entity)('room_facilities')
], RoomFacility);
//# sourceMappingURL=RoomFacility.js.map