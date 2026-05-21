"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomBookingController = void 0;
const data_source_1 = require("../database/data-source");
const RoomBooking_1 = require("../models/RoomBooking");
const Room_1 = require("../models/Room");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class RoomBookingController {
    constructor() {
        this.roomBookingRepository = data_source_1.AppDataSource.getRepository(RoomBooking_1.RoomBooking);
        this.roomRepository = data_source_1.AppDataSource.getRepository(Room_1.Room);
    }
    async generateBookingId() {
        const lastBooking = await this.roomBookingRepository
            .createQueryBuilder('booking')
            .select('MAX(CAST(SUBSTRING(booking.bookingId, 3) AS INTEGER))', 'max')
            .getRawOne();
        const nextNum = (lastBooking?.max || 0) + 1;
        return `RM${nextNum.toString().padStart(5, '0')}`;
    }
    async bookRoom(req, res) {
        try {
            const { roomId, notes } = req.body;
            const userId = req.user?.id;
            if (!userId) {
                return (0, response_1.sendError)(res, 'Unauthorized', 401);
            }
            const room = await this.roomRepository.findOne({ where: { id: roomId } });
            if (!room) {
                return (0, response_1.sendError)(res, 'Room not found', 404);
            }
            const existingBooking = await this.roomBookingRepository.findOne({
                where: { userId, roomId, status: 'PENDING' },
            });
            if (existingBooking) {
                return (0, response_1.sendError)(res, 'Room already booked by you', 400);
            }
            const bookingId = await this.generateBookingId();
            const booking = new RoomBooking_1.RoomBooking();
            booking.bookingId = bookingId;
            booking.userId = userId;
            booking.roomId = roomId;
            booking.notes = notes;
            booking.bookingFee = 500;
            await this.roomBookingRepository.save(booking);
            logger_1.Logger.info(`Room booked: ${bookingId} by ${userId}`);
            return (0, response_1.sendSuccess)(res, 'Room booked successfully', {
                bookingId: booking.bookingId,
                amount: `NPR ${booking.bookingFee}`,
                status: 'PENDING',
                room: { id: room.id, title: room.title },
            }, 201);
        }
        catch (error) {
            logger_1.Logger.error('Book room error', error);
            return (0, response_1.sendError)(res, 'Failed to book room', 500, error);
        }
    }
    async getMyBookings(req, res) {
        try {
            const userId = req.user?.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
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
            return (0, response_1.sendSuccess)(res, 'Bookings fetched successfully', {
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
        }
        catch (error) {
            logger_1.Logger.error('Get bookings error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch bookings', 500, error);
        }
    }
    async getBookingById(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const booking = await this.roomBookingRepository
                .createQueryBuilder('booking')
                .leftJoinAndSelect('booking.room', 'room')
                .leftJoinAndSelect('room.images', 'images')
                .where('booking.id = :id', { id })
                .getOne();
            if (!booking) {
                return (0, response_1.sendError)(res, 'Booking not found', 404);
            }
            if (booking.userId !== userId) {
                return (0, response_1.sendError)(res, 'Unauthorized', 401);
            }
            return (0, response_1.sendSuccess)(res, 'Booking fetched successfully', {
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
        }
        catch (error) {
            logger_1.Logger.error('Get booking error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch booking', 500, error);
        }
    }
    async cancelBooking(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user?.id;
            const booking = await this.roomBookingRepository.findOne({ where: { id } });
            if (!booking) {
                return (0, response_1.sendError)(res, 'Booking not found', 404);
            }
            if (booking.userId !== userId) {
                return (0, response_1.sendError)(res, 'Unauthorized', 401);
            }
            if (booking.status !== 'PENDING') {
                return (0, response_1.sendError)(res, 'Can only cancel pending bookings', 400);
            }
            booking.status = 'CANCELLED';
            await this.roomBookingRepository.save(booking);
            logger_1.Logger.info(`Booking cancelled: ${booking.bookingId}`);
            return (0, response_1.sendSuccess)(res, 'Booking cancelled successfully');
        }
        catch (error) {
            logger_1.Logger.error('Cancel booking error', error);
            return (0, response_1.sendError)(res, 'Failed to cancel booking', 500, error);
        }
    }
}
exports.RoomBookingController = RoomBookingController;
//# sourceMappingURL=RoomBookingController.js.map