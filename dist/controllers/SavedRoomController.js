"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedRoomController = void 0;
const data_source_1 = require("../database/data-source");
const SavedRoom_1 = require("../models/SavedRoom");
const Room_1 = require("../models/Room");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class SavedRoomController {
    constructor() {
        this.savedRoomRepository = data_source_1.AppDataSource.getRepository(SavedRoom_1.SavedRoom);
        this.roomRepository = data_source_1.AppDataSource.getRepository(Room_1.Room);
    }
    async saveRoom(req, res) {
        try {
            const { roomId } = req.params;
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.sendError)(res, 'Unauthorized', 401);
            }
            const room = await this.roomRepository.findOne({ where: { id: roomId } });
            if (!room) {
                return (0, response_1.sendError)(res, 'Room not found', 404);
            }
            const existing = await this.savedRoomRepository.findOne({
                where: { userId, roomId },
            });
            if (existing) {
                return (0, response_1.sendError)(res, 'Room already saved', 400);
            }
            const savedRoom = new SavedRoom_1.SavedRoom();
            savedRoom.userId = userId;
            savedRoom.roomId = roomId;
            await this.savedRoomRepository.save(savedRoom);
            logger_1.Logger.info(`Room saved: ${roomId} by ${userId}`);
            return (0, response_1.sendSuccess)(res, 'Room saved successfully', {}, 201);
        }
        catch (error) {
            logger_1.Logger.error('Save room error', error);
            return (0, response_1.sendError)(res, 'Failed to save room', 500, error);
        }
    }
    async getSavedRooms(req, res) {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const [savedRooms, total] = await this.savedRoomRepository
                .createQueryBuilder('saved')
                .leftJoinAndSelect('saved.room', 'room')
                .leftJoinAndSelect('room.images', 'images')
                .leftJoinAndSelect('room.facilities', 'facilities')
                .where('saved.userId = :userId', { userId })
                .orderBy('saved.savedAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();
            return (0, response_1.sendSuccess)(res, 'Saved rooms fetched successfully', {
                rooms: savedRooms.map((saved) => ({
                    id: saved.room.id,
                    title: saved.room.title,
                    price: `NPR ${parseInt(saved.room.price.toString()).toLocaleString('en-US')}`,
                    location: saved.room.location,
                    roomType: saved.room.roomType,
                    image: saved.room.images?.[0]?.imageUrl,
                    facilities: saved.room.facilities?.map((f) => f.facility) || [],
                    savedAt: saved.savedAt,
                })),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            logger_1.Logger.error('Get saved rooms error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch saved rooms', 500, error);
        }
    }
    async removeSavedRoom(req, res) {
        try {
            const { roomId } = req.params;
            const userId = req.user?.id;
            const saved = await this.savedRoomRepository.findOne({
                where: { userId, roomId },
            });
            if (!saved) {
                return (0, response_1.sendError)(res, 'Saved room not found', 404);
            }
            await this.savedRoomRepository.remove(saved);
            logger_1.Logger.info(`Saved room removed: ${roomId} by ${userId}`);
            return (0, response_1.sendSuccess)(res, 'Room removed from saved');
        }
        catch (error) {
            logger_1.Logger.error('Remove saved room error', error);
            return (0, response_1.sendError)(res, 'Failed to remove saved room', 500, error);
        }
    }
}
exports.SavedRoomController = SavedRoomController;
//# sourceMappingURL=SavedRoomController.js.map