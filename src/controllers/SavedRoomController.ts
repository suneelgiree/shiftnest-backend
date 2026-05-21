import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { SavedRoom } from '../models/SavedRoom';
import { Room } from '../models/Room';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

export class SavedRoomController {
  private savedRoomRepository = AppDataSource.getRepository(SavedRoom);
  private roomRepository = AppDataSource.getRepository(Room);

  async saveRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const userId = (req as any).user?.id;

      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const room = await this.roomRepository.findOne({ where: { id: roomId } });
      if (!room) {
        return sendError(res, 'Room not found', 404);
      }

      const existing = await this.savedRoomRepository.findOne({
        where: { userId, roomId },
      });
      if (existing) {
        return sendError(res, 'Room already saved', 400);
      }

      const savedRoom = new SavedRoom();
      savedRoom.userId = userId;
      savedRoom.roomId = roomId;

      await this.savedRoomRepository.save(savedRoom);

      Logger.info(`Room saved: ${roomId} by ${userId}`);
      return sendSuccess(res, 'Room saved successfully', {}, 201);
    } catch (error) {
      Logger.error('Save room error', error);
      return sendError(res, 'Failed to save room', 500, error);
    }
  }

  async getSavedRooms(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
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

      return sendSuccess(res, 'Saved rooms fetched successfully', {
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
    } catch (error) {
      Logger.error('Get saved rooms error', error);
      return sendError(res, 'Failed to fetch saved rooms', 500, error);
    }
  }

  async removeSavedRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const userId = (req as any).user?.id;

      const saved = await this.savedRoomRepository.findOne({
        where: { userId, roomId },
      });
      if (!saved) {
        return sendError(res, 'Saved room not found', 404);
      }

      await this.savedRoomRepository.remove(saved);

      Logger.info(`Saved room removed: ${roomId} by ${userId}`);
      return sendSuccess(res, 'Room removed from saved');
    } catch (error) {
      Logger.error('Remove saved room error', error);
      return sendError(res, 'Failed to remove saved room', 500, error);
    }
  }
}
