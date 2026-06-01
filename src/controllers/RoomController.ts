import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Room } from '../models/Room';
import { RoomFacility } from '../models/RoomFacility';
import { RoomImage } from '../models/RoomImage';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';
import { User } from '../models/User';
import { hasActiveAccess } from './SubscriptionController';

export class RoomController {
  private roomRepository = AppDataSource.getRepository(Room);
  private roomFacilityRepository = AppDataSource.getRepository(RoomFacility);
  private roomImageRepository = AppDataSource.getRepository(RoomImage);
  private userRepository = AppDataSource.getRepository(User);

  // Create new room (Owner only)
  async createRoom(req: Request, res: Response) {
    try {
      const { title, description, price, location, city, latitude, longitude, roomType, bedrooms, bathrooms, facilities } = req.body;
      const ownerId = (req as any).user?.id;

      if (!ownerId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const room = new Room();
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
          const roomFacility = new RoomFacility();
          roomFacility.facility = facility;
          roomFacility.roomId = savedRoom.id;
          await this.roomFacilityRepository.save(roomFacility);
        }
      }

      Logger.info(`Room created: ${savedRoom.id} by ${ownerId}`);
      return sendSuccess(res, 'Room created successfully', { id: savedRoom.id, title: savedRoom.title }, 201);
    } catch (error) {
      Logger.error('Create room error', error);
      return sendError(res, 'Failed to create room', 500, error);
    }
  }

  // Get all rooms with filters
  async getRooms(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const { location, city, minPrice, maxPrice, roomType, facilities, search } = req.query;

      let query = this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.owner', 'owner')
        .leftJoinAndSelect('room.images', 'images')
        .leftJoinAndSelect('room.facilities', 'facilities')
        .where('room.isActive = :isActive', { isActive: true });

      if (location) query = query.andWhere('room.location ILIKE :location', { location: `%${location}%` });
      if (city) query = query.andWhere('room.city ILIKE :city', { city: `%${city}%` });
      if (roomType) query = query.andWhere('room.roomType = :roomType', { roomType });
      if (minPrice || maxPrice) {
        query = query.andWhere('room.price BETWEEN :minPrice AND :maxPrice', {
          minPrice: minPrice ? parseFloat(minPrice as string) : 0,
          maxPrice: maxPrice ? parseFloat(maxPrice as string) : 999999,
        });
      }
      if (search) query = query.andWhere('room.title ILIKE :search', { search: `%${search}%` });

      if (facilities) {
        const facilityArray = (facilities as string).split(',');
        query = query.andWhere('facilities.facility IN (:...facilities)', { facilities: facilityArray });
      }

      const [rooms, total] = await query
        .orderBy('room.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return sendSuccess(res, 'Rooms fetched successfully', {
        rooms: rooms.map((room) => this.formatRoomResponse(room)),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      Logger.error('Get rooms error', error);
      return sendError(res, 'Failed to fetch rooms', 500, error);
    }
  }

  // Get rooms owned by the logged-in user
  async getMyRooms(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.id;
      if (!ownerId) return sendError(res, 'Unauthorized', 401);
      const rooms = await this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.images', 'images')
        .leftJoinAndSelect('room.facilities', 'facilities')
        .where('room.ownerId = :ownerId', { ownerId })
        .orderBy('room.createdAt', 'DESC')
        .getMany();
      return sendSuccess(res, 'My rooms fetched', rooms.map((r) => this.formatRoomResponse(r)));
    } catch (error) {
      Logger.error('Get my rooms error', error);
      return sendError(res, 'Failed to fetch your rooms', 500, error);
    }
  }

  // Get room details
  async getRoomById(req: Request, res: Response) {
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
        return sendError(res, 'Room not found', 404);
      }

      // Reveal owner contact + exact location only if the viewer has paid access.
      let unlocked = false;
      if (req.user?.id) {
        const viewer = await this.userRepository.findOne({
          where: { id: req.user.id },
          select: ['id', 'accessExpiresAt'],
        });
        unlocked = hasActiveAccess(viewer || {});
      }

      return sendSuccess(res, 'Room fetched successfully', this.formatRoomDetailResponse(room, unlocked));
    } catch (error) {
      Logger.error('Get room error', error);
      return sendError(res, 'Failed to fetch room', 500, error);
    }
  }

  // Get popular areas
  async getPopularAreas(req: Request, res: Response) {
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

      return sendSuccess(res, 'Popular areas fetched', areas);
    } catch (error) {
      Logger.error('Get popular areas error', error);
      return sendError(res, 'Failed to fetch popular areas', 500, error);
    }
  }

  // Get recommended rooms
  async getRecommendedRooms(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 6;

      const rooms = await this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.owner', 'owner')
        .leftJoinAndSelect('room.images', 'images', 'images.isPrimary = :isPrimary', { isPrimary: true })
        .where('room.isActive = :isActive', { isActive: true })
        .orderBy('room.createdAt', 'DESC')
        .limit(limit)
        .getMany();

      return sendSuccess(res, 'Recommended rooms fetched', rooms.map((room) => this.formatRoomResponse(room)));
    } catch (error) {
      Logger.error('Get recommended rooms error', error);
      return sendError(res, 'Failed to fetch recommended rooms', 500, error);
    }
  }

  // Update room
  async updateRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ownerId = (req as any).user?.id;
      const { title, description, price, location, city, bedrooms, bathrooms, facilities } = req.body;

      const room = await this.roomRepository.findOne({ where: { id } });
      if (!room) {
        return sendError(res, 'Room not found', 404);
      }

      if (room.ownerId !== ownerId) {
        return sendError(res, 'Unauthorized', 401);
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
          const roomFacility = new RoomFacility();
          roomFacility.facility = facility;
          roomFacility.roomId = id;
          await this.roomFacilityRepository.save(roomFacility);
        }
      }

      Logger.info(`Room updated: ${id}`);
      return sendSuccess(res, 'Room updated successfully', room);
    } catch (error) {
      Logger.error('Update room error', error);
      return sendError(res, 'Failed to update room', 500, error);
    }
  }

  // Delete room
  async deleteRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ownerId = (req as any).user?.id;

      const room = await this.roomRepository.findOne({ where: { id } });
      if (!room) {
        return sendError(res, 'Room not found', 404);
      }

      if (room.ownerId !== ownerId) {
        return sendError(res, 'Unauthorized', 401);
      }

      room.isActive = false;
      await this.roomRepository.save(room);

      Logger.info(`Room deleted: ${id}`);
      return sendSuccess(res, 'Room deleted successfully');
    } catch (error) {
      Logger.error('Delete room error', error);
      return sendError(res, 'Failed to delete room', 500, error);
    }
  }

  private formatRoomResponse(room: Room) {
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

  private formatRoomDetailResponse(room: Room | null, unlocked = false) {
    if (!room) return null;
    return {
      id: room.id,
      title: room.title,
      description: room.description,
      price: `NPR ${parseInt(room.price.toString()).toLocaleString('en-US')}`,
      location: room.location,
      city: room.city,
      // exact coordinates gated behind access
      latitude: unlocked ? room.latitude : null,
      longitude: unlocked ? room.longitude : null,
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
      locked: !unlocked,
      owner: unlocked
        ? {
            id: room.owner?.id,
            name: `${room.owner?.firstName} ${room.owner?.lastName}`,
            phone: room.owner?.phone,
            email: room.owner?.email,
            locked: false,
          }
        : {
            // identity hidden until paid
            locked: true,
          },
    };
  }
}

