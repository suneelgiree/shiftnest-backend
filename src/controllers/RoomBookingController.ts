import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { RoomBooking } from '../models/RoomBooking';
import { Room } from '../models/Room';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

export class RoomBookingController {
  private roomBookingRepository = AppDataSource.getRepository(RoomBooking);
  private roomRepository = AppDataSource.getRepository(Room);

  private async generateBookingId(): Promise<string> {
    const lastBooking = await this.roomBookingRepository
      .createQueryBuilder('booking')
      .select('MAX(CAST(SUBSTRING(booking.bookingId, 3) AS INTEGER))', 'max')
      .getRawOne();

    const nextNum = (lastBooking?.max || 0) + 1;
    return `RM${nextNum.toString().padStart(5, '0')}`;
  }

  async bookRoom(req: Request, res: Response) {
    try {
      const { roomId, notes } = req.body;
      const userId = (req as any).user?.id;

      if (!userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      const room = await this.roomRepository.findOne({ where: { id: roomId } });
      if (!room) {
        return sendError(res, 'Room not found', 404);
      }

      const existingBooking = await this.roomBookingRepository.findOne({
        where: { userId, roomId, status: 'PENDING' },
      });
      if (existingBooking) {
        return sendError(res, 'Room already booked by you', 400);
      }

      const bookingId = await this.generateBookingId();

      const booking = new RoomBooking();
      booking.bookingId = bookingId;
      booking.userId = userId;
      booking.roomId = roomId;
      booking.notes = notes;
      booking.bookingFee = 500;

      await this.roomBookingRepository.save(booking);

      Logger.info(`Room booked: ${bookingId} by ${userId}`);
      return sendSuccess(res, 'Room booked successfully', {
        bookingId: booking.bookingId,
        amount: `NPR ${booking.bookingFee}`,
        status: 'PENDING',
        room: { id: room.id, title: room.title },
      }, 201);
    } catch (error) {
      Logger.error('Book room error', error);
      return sendError(res, 'Failed to book room', 500, error);
    }
  }

  async getMyBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [bookings, total] = await this.roomBookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.room', 'room')
        .leftJoinAndSelect('room.images', 'images')
        .where('booking.userId = :userId', { userId })
        .orderBy('booking.bookingDate', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return sendSuccess(res, 'Bookings fetched successfully', {
        bookings: bookings.map((b) => ({
          bookingId: b.bookingId,
          status: b.status,
          amount: `NPR ${b.bookingFee}`,
          bookingDate: b.bookingDate,
          room: {
            id: b.room.id,
            title: b.room.title,
            image: b.room.images?.[0]?.imageUrl,
            price: `NPR ${parseInt(b.room.price.toString()).toLocaleString('en-US')}`,
          },
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      Logger.error('Get bookings error', error);
      return sendError(res, 'Failed to fetch bookings', 500, error);
    }
  }

  async getBookingById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const booking = await this.roomBookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.room', 'room')
        .leftJoinAndSelect('room.images', 'images')
        .where('booking.id = :id', { id })
        .getOne();

      if (!booking) {
        return sendError(res, 'Booking not found', 404);
      }

      if (booking.userId !== userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      return sendSuccess(res, 'Booking fetched successfully', {
        bookingId: booking.bookingId,
        status: booking.status,
        amount: `NPR ${booking.bookingFee}`,
        bookingDate: booking.bookingDate,
        notes: booking.notes,
        room: {
          id: booking.room.id,
          title: booking.room.title,
          price: `NPR ${parseInt(booking.room.price.toString()).toLocaleString('en-US')}`,
          images: booking.room.images?.map((img) => img.imageUrl),
        },
      });
    } catch (error) {
      Logger.error('Get booking error', error);
      return sendError(res, 'Failed to fetch booking', 500, error);
    }
  }

  async cancelBooking(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const booking = await this.roomBookingRepository.findOne({ where: { id } });
      if (!booking) {
        return sendError(res, 'Booking not found', 404);
      }

      if (booking.userId !== userId) {
        return sendError(res, 'Unauthorized', 401);
      }

      if (booking.status !== 'PENDING') {
        return sendError(res, 'Can only cancel pending bookings', 400);
      }

      booking.status = 'CANCELLED';
      await this.roomBookingRepository.save(booking);

      Logger.info(`Booking cancelled: ${booking.bookingId}`);
      return sendSuccess(res, 'Booking cancelled successfully');
    } catch (error) {
      Logger.error('Cancel booking error', error);
      return sendError(res, 'Failed to cancel booking', 500, error);
    }
  }

  // Bookings made on rooms owned by the logged-in user
  async getOwnerBookings(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.id;
      if (!ownerId) return sendError(res, 'Unauthorized', 401);
      const bookings = await this.roomBookingRepository
        .createQueryBuilder('booking')
        .leftJoinAndSelect('booking.room', 'room')
        .leftJoinAndSelect('booking.user', 'tenant')
        .leftJoinAndSelect('room.images', 'images')
        .where('room.ownerId = :ownerId', { ownerId })
        .orderBy('booking.bookingDate', 'DESC')
        .getMany();
      return sendSuccess(res, 'Owner bookings fetched', bookings.map((b) => ({
        bookingId: b.bookingId,
        status: b.status,
        amount: `NPR ${b.bookingFee}`,
        bookingDate: b.bookingDate,
        notes: b.notes,
        tenant: {
          id: b.user?.id,
          name: `${b.user?.firstName ?? ''} ${b.user?.lastName ?? ''}`.trim(),
          phone: b.user?.phone,
        },
        room: {
          id: b.room?.id,
          title: b.room?.title,
          image: b.room?.images?.[0]?.imageUrl,
        },
      })));
    } catch (error) {
      Logger.error('Get owner bookings error', error);
      return sendError(res, 'Failed to fetch bookings', 500, error);
    }
  }
}
