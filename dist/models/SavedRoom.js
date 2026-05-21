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
exports.SavedRoom = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Room_1 = require("./Room");
let SavedRoom = class SavedRoom {
};
exports.SavedRoom = SavedRoom;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SavedRoom.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, (user) => user.savedRooms),
    (0, typeorm_1.JoinColumn)({ name: 'userId' }),
    __metadata("design:type", User_1.User)
], SavedRoom.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SavedRoom.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Room_1.Room, (room) => room.savedBy, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'roomId' }),
    __metadata("design:type", Room_1.Room)
], SavedRoom.prototype, "room", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], SavedRoom.prototype, "roomId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SavedRoom.prototype, "savedAt", void 0);
exports.SavedRoom = SavedRoom = __decorate([
    (0, typeorm_1.Entity)('saved_rooms'),
    (0, typeorm_1.Unique)(['userId', 'roomId'])
], SavedRoom);
//# sourceMappingURL=SavedRoom.js.map