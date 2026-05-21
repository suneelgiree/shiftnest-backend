"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomController = void 0;
const data_source_1 = require("../database/data-source");
const Room_1 = require("../models/Room");
const RoomFacility_1 = require("../models/RoomFacility");
const RoomImage_1 = require("../models/RoomImage");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class RoomController {
    constructor() {
        this.roomRepository = data_source_1.AppDataSource.getRepository(Room_1.Room);
        this.roomFacilityRepository = data_source_1.AppDataSource.getRepository(RoomFacility_1.RoomFacility);
        this.roomImageRepository = data_source_1.AppDataSource.getRepository(RoomImage_1.RoomImage);
    }
    // Create new room (Owner only)
    async createRoom(req, res) {
        try {
            const { title, description, price, location, city, latitude, longitude, roomType, bedrooms, bathrooms, facilities } = req.body;
            const ownerId = req.user?.id;
            if (!ownerId) {
                return (0, response_1.sendError)(res, 'Unauthorized', 401);
            }
            const room = new Room_1.Room();
            room.title = title;
            room.description = description;
            room.price = parseFloat(price);
            room.location = location;
            room.city = city;
            room.latitude = latitude ? parseFloat(latitude) : null;
            room.longitude = longitude ? parseFloat(longitude) : null;
            room.roomType = roomType || '1BHK';
            room.bedrooms = parseInt(bedrooms) || 1;
            room.bathrooms = parseInt(bathrooms) || 1;
            room.ownerId = ownerId;
            const savedRoom = await this.roomRepository.save(room);
            if (facilities && Array.isArray(facilities)) {
                for (const facility of facilities) {
                    const roomFacility = new RoomFacility_1.RoomFacility();
                    roomFacility.facility = facility;
                    roomFacility.roomId = savedRoom.id;
                    await this.roomFacilityRepository.save(roomFacility);
                }
            }
            logger_1.Logger.info(`Room created: ${savedRoom.id} by ${ownerId}`);
            return (0, response_1.sendSuccess)(res, 'Room created successfully', { id: savedRoom.id, title: savedRoom.title }, 201);
        }
        catch (error) {
            logger_1.Logger.error('Create room error', error);
            return (0, response_1.sendError)(res, 'Failed to create room', 500, error);
        }
    }
    // Get all rooms with filters
    async getRooms(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const { location, city, minPrice, maxPrice, roomType, facilities, search } = req.query;
            let query = this.roomRepository
                .createQueryBuilder('room')
                .leftJoinAndSelect('room.owner', 'owner')
                .leftJoinAndSelect('room.images', 'images')
                .leftJoinAndSelect('room.facilities', 'facilities')
                .where('room.isActive = :isActive', { isActive: true });
            if (location)
                query = query.andWhere('room.location ILIKE :location', { location: `%${location}%` });
            if (city)
                query = query.andWhere('room.city ILIKE :city', { city: `%${city}%` });
            if (roomType)
                query = query.andWhere('room.roomType = :roomType', { roomType });
            if (minPrice || maxPrice) {
                query = query.andWhere('room.price BETWEEN :minPrice AND :maxPrice', {
                    minPrice: minPrice ? parseFloat(minPrice) : 0,
                    maxPrice: maxPrice ? parseFloat(maxPrice) : 999999,
                });
            }
            if (search)
                query = query.andWhere('room.title ILIKE :search', { search: `%${search}%` });
            if (facilities) {
                const facilityArray = facilities.split(',');
                query = query.andWhere('facilities.facility IN (:...facilities)', { facilities: facilityArray });
            }
            const [rooms, total] = await query
                .orderBy('room.createdAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();
            return (0, response_1.sendSuccess)(res, 'Rooms fetched successfully', {
                rooms: rooms.map((room) => this.formatRoomResponse(room)),
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            logger_1.Logger.error('Get rooms error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch rooms', 500, error);
        }
    }
    // Get room details
    async getRoomById(req, res) {
        try {
            const { id } = req.params;
            const room = await this.roomRepository
                .createQueryBuilder('room')
                .leftJoinAndSelect('room.owner', 'owner')
                .leftJoinAndSelect('room.images', 'images')
                .leftJoinAndSelect('room.facilities', 'facilities')
                .where('room.id = :id', { id })
                .orderBy('images.orderIndex', 'ASC')
                .getOne();
            if (!room) {
                return (0, response_1.sendError)(res, 'Room not found', 404);
            }
            return (0, response_1.sendSuccess)(res, 'Room fetched successfully', this.formatRoomDetailResponse(room));
        }
        catch (error) {
            logger_1.Logger.error('Get room error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch room', 500, error);
        }
    }
    // Get popular areas
    async getPopularAreas(req, res) {
        try {
            const areas = await this.roomRepository
                .createQueryBuilder('room')
                .select('room.location', 'location')
                .addSelect('COUNT(*)', 'count')
                .where('room.isActive = :isActive', { isActive: true })
                .groupBy('room.location')
                .orderBy('count', 'DESC')
                .limit(10)
                .getRawMany();
            return (0, response_1.sendSuccess)(res, 'Popular areas fetched', areas);
        }
        catch (error) {
            logger_1.Logger.error('Get popular areas error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch popular areas', 500, error);
        }
    }
    // Get recommended rooms
    async getRecommendedRooms(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 6;
            const rooms = await this.roomRepository
                .createQueryBuilder('room')
                .leftJoinAndSelect('room.owner', 'owner')
                .leftJoinAndSelect('room.images', 'images', 'images.isPrimary = :isPrimary', { isPrimary: true })
                .where('room.isActive = :isActive', { isActive: true })
                .orderBy('room.createdAt', 'DESC')
                .limit(limit)
                .getMany();
            return (0, response_1.sendSuccess)(res, 'Recommended rooms fetched', rooms.map((room) => this.formatRoomResponse(room)));
        }
        catch (error) {
            logger_1.Logger.error('Get recommended rooms error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch recommended rooms', 500, error);
        }
    }
    // Update room
    async updateRoom(req, res) {
        try {
            const { id } = req.params;
            const ownerId = req.user?.id;
            const { title, description, price, location, city, bedrooms, bathrooms, facilities } = req.body;
            const room = await this.roomRepository.findOne({ where: { id } });
            if (!room) {
                return (0, response_1.sendError)(res, 'Room not found', 404);
            }
            if (room.ownerId !== ownerId) {
                return (0, response_1.sendError)(res, 'Unauthorized', 401);
            }
            room.title = title || room.title;
            room.description = description || room.description;
            room.price = price ? parseFloat(price) : room.price;
            room.location = location || room.location;
            room.city = city || room.city;
            room.bedrooms = bedrooms ? parseInt(bedrooms) : room.bedrooms;
            room.bathrooms = bathrooms ? parseInt(bathrooms) : room.bathrooms;
            await this.roomRepository.save(room);
            if (facilities && Array.isArray(facilities)) {
                await this.roomFacilityRepository.delete({ roomId: id });
                for (const facility of facilities) {
                    const roomFacility = new RoomFacility_1.RoomFacility();
                    roomFacility.facility = facility;
                    roomFacility.roomId = id;
                    await this.roomFacilityRepository.save(roomFacility);
                }
            }
            logger_1.Logger.info(`Room updated: ${id}`);
            return (0, response_1.sendSuccess)(res, 'Room updated successfully', room);
        }
        catch (error) {
            logger_1.Logger.error('Update room error', error);
            return (0, response_1.sendError)(res, 'Failed to update room', 500, error);
        }
    }
    // Delete room
    async deleteRoom(req, res) {
        try {
            const { id } = req.params;
            const ownerId = req.user?.id;
            const room = await this.roomRepository.findOne({ where: { id } });
            if (!room) {
                return (0, response_1.sendError)(res, 'Room not found', 404);
            }
            if (room.ownerId !== ownerId) {
                return (0, response_1.sendError)(res, 'Unauthorized', 401);
            }
            room.isActive = false;
            await this.roomRepository.save(room);
            logger_1.Logger.info(`Room deleted: ${id}`);
            return (0, response_1.sendSuccess)(res, 'Room deleted successfully');
        }
        catch (error) {
            logger_1.Logger.error('Delete room error', error);
            return (0, response_1.sendError)(res, 'Failed to delete room', 500, error);
        }
    }
    formatRoomResponse(room) {
        return {
            id: room.id,
            title: room.title,
            price: `NPR ${parseInt(room.price.toString()).toLocaleString('en-US')}`,
            location: room.location,
            city: room.city,
            roomType: room.roomType,
            bedrooms: room.bedrooms,
            bathrooms: room.bathrooms,
            image: room.images?.find((img) => img.isPrimary)?.imageUrl || room.images?.[0]?.imageUrl,
            facilities: room.facilities?.map((f) => f.facility) || [],
            owner: {
                id: room.owner?.id,
                name: `${room.owner?.firstName} ${room.owner?.lastName}`,
                phone: room.owner?.phone,
            },
        };
    }
    formatRoomDetailResponse(room) {
        if (!room)
            return null;
        return {
            id: room.id,
            title: room.title,
            description: room.description,
            price: `NPR ${parseInt(room.price.toString()).toLocaleString('en-US')}`,
            location: room.location,
            city: room.city,
            latitude: room.latitude,
            longitude: room.longitude,
            roomType: room.roomType,
            bedrooms: room.bedrooms,
            bathrooms: room.bathrooms,
            isVerified: room.isVerified,
            images: room.images?.map((img, idx) => ({
                url: img.imageUrl,
                isPrimary: img.isPrimary,
                index: `${idx + 1}/${room.images.length}`,
            })) || [],
            facilities: room.facilities?.map((f) => f.facility) || [],
            owner: {
                id: room.owner?.id,
                name: `${room.owner?.firstName} ${room.owner?.lastName}`,
                phone: room.owner?.phone,
                email: room.owner?.email,
                locked: true,
            },
            createdAt: room.createdAt,
        };
    }
}
exports.RoomController = RoomController;
//# sourceMappingURL=RoomController.js.map