"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftBookingController = void 0;
const data_source_1 = require("../database/data-source");
const ShiftBooking_1 = require("../models/ShiftBooking");
const Driver_1 = require("../models/Driver");
const Vehicle_1 = require("../models/Vehicle");
const FareCalculatorService_1 = require("../services/FareCalculatorService");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class ShiftBookingController {
    constructor() {
        this.shiftBookingRepo = data_source_1.AppDataSource.getRepository(ShiftBooking_1.ShiftBooking);
        this.driverRepo = data_source_1.AppDataSource.getRepository(Driver_1.Driver);
        this.vehicleRepo = data_source_1.AppDataSource.getRepository(Vehicle_1.Vehicle);
        this.fareService = new FareCalculatorService_1.FareCalculatorService();
    }
    async generateBookingId() {
        const last = await this.shiftBookingRepo
            .createQueryBuilder('sb')
            .select('MAX(CAST(SUBSTRING(sb.bookingId, 3) AS INTEGER))', 'max')
            .getRawOne();
        const next = (last?.max || 0) + 1;
        return `SH${next.toString().padStart(5, '0')}`;
    }
    async estimate(req, res) {
        try {
            const { vehicleType, helpers = 0 } = req.body;
            if (!vehicleType)
                return (0, response_1.sendError)(res, 'vehicleType is required', 400);
            const breakdown = await this.fareService.estimate(vehicleType, Number(helpers));
            return (0, response_1.sendSuccess)(res, 'Fare estimated', {
                ...breakdown,
                formatted: {
                    baseFare: `NPR ${breakdown.baseFare.toLocaleString('en-US')}`,
                    helpersCost: `NPR ${breakdown.helpersCost.toLocaleString('en-US')}`,
                    serviceFee: `NPR ${breakdown.serviceFee.toLocaleString('en-US')}`,
                    totalFare: `NPR ${breakdown.totalFare.toLocaleString('en-US')}`,
                },
            });
        }
        catch (error) {
            logger_1.Logger.error('Fare estimate error', error);
            return (0, response_1.sendError)(res, error.message || 'Failed to estimate fare', 400);
        }
    }
    async book(req, res) {
        try {
            const userId = req.user.id;
            const { vehicleType, fromLocation, toLocation, moveDate, helpers = 0, notes } = req.body;
            if (!vehicleType || !fromLocation || !toLocation || !moveDate) {
                return (0, response_1.sendError)(res, 'vehicleType, fromLocation, toLocation, moveDate are required', 400);
            }
            const vehicle = await this.vehicleRepo.findOne({
                where: { vehicleType: vehicleType.toUpperCase(), isActive: true },
            });
            if (!vehicle)
                return (0, response_1.sendError)(res, 'Invalid vehicle type', 400);
            const breakdown = await this.fareService.estimate(vehicleType, Number(helpers));
            const driver = await this.driverRepo
                .createQueryBuilder('d')
                .leftJoinAndSelect('d.vehicle', 'v')
                .where('d.isAvailable = :avail', { avail: true })
                .andWhere('v.vehicleType = :vt', { vt: vehicleType.toUpperCase() })
                .getOne();
            const bookingId = await this.generateBookingId();
            const booking = this.shiftBookingRepo.create({
                bookingId,
                userId,
                vehicleId: vehicle.id,
                driverId: driver?.id ?? null,
                fromLocation,
                toLocation,
                moveDate,
                helpers: Number(helpers),
                baseFare: breakdown.baseFare,
                helpersCost: breakdown.helpersCost,
                serviceFee: breakdown.serviceFee,
                totalFare: breakdown.totalFare,
                notes,
                status: driver ? 'CONFIRMED' : 'PENDING',
            });
            if (driver) {
                driver.isAvailable = false;
                await this.driverRepo.save(driver);
            }
            await this.shiftBookingRepo.save(booking);
            logger_1.Logger.info(`Shift booked: ${bookingId} by ${userId}`);
            return (0, response_1.sendSuccess)(res, 'Shift booked successfully', {
                bookingId: booking.bookingId,
                status: booking.status,
                totalFare: `NPR ${booking.totalFare.toLocaleString('en-US')}`,
                driver: driver ? { id: driver.id, rating: driver.rating, plateNumber: driver.plateNumber } : null,
                message: driver ? 'Driver assigned' : 'Booking confirmed, driver will be assigned shortly',
            }, 201);
        }
        catch (error) {
            logger_1.Logger.error('Book shift error', error);
            return (0, response_1.sendError)(res, 'Failed to book shift', 500);
        }
    }
    async getMyShifts(req, res) {
        try {
            const userId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const [bookings, total] = await this.shiftBookingRepo
                .createQueryBuilder('sb')
                .leftJoinAndSelect('sb.vehicle', 'vehicle')
                .leftJoinAndSelect('sb.driver', 'driver')
                .leftJoinAndSelect('driver.user', 'driverUser')
                .where('sb.userId = :userId', { userId })
                .orderBy('sb.createdAt', 'DESC')
                .skip(skip)
                .take(limit)
                .getManyAndCount();
            return (0, response_1.sendSuccess)(res, 'Shift bookings fetched', {
                bookings: bookings.map((b) => this.formatShift(b)),
                pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
            });
        }
        catch (error) {
            logger_1.Logger.error('Get my shifts error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch shifts', 500);
        }
    }
    async getShiftById(req, res) {
        try {
            const { id } = req.params;
            const booking = await this.shiftBookingRepo
                .createQueryBuilder('sb')
                .leftJoinAndSelect('sb.vehicle', 'vehicle')
                .leftJoinAndSelect('sb.driver', 'driver')
                .leftJoinAndSelect('driver.user', 'driverUser')
                .where('sb.id = :id OR sb.bookingId = :id', { id })
                .getOne();
            if (!booking)
                return (0, response_1.sendError)(res, 'Shift booking not found', 404);
            if (booking.userId !== req.user.id && req.user.role !== 'admin') {
                return (0, response_1.sendError)(res, 'Unauthorized', 403);
            }
            return (0, response_1.sendSuccess)(res, 'Shift booking fetched', this.formatShift(booking));
        }
        catch (error) {
            return (0, response_1.sendError)(res, 'Failed to fetch shift', 500);
        }
    }
    async trackShift(req, res) {
        try {
            const { id } = req.params;
            const booking = await this.shiftBookingRepo
                .createQueryBuilder('sb')
                .leftJoinAndSelect('sb.driver', 'driver')
                .where('sb.id = :id OR sb.bookingId = :id', { id })
                .getOne();
            if (!booking)
                return (0, response_1.sendError)(res, 'Shift not found', 404);
            if (!booking.driver)
                return (0, response_1.sendError)(res, 'Driver not yet assigned', 404);
            return (0, response_1.sendSuccess)(res, 'Tracking info fetched', {
                bookingId: booking.bookingId,
                status: booking.status,
                driver: {
                    currentLat: booking.driver.currentLat,
                    currentLng: booking.driver.currentLng,
                    plateNumber: booking.driver.plateNumber,
                    rating: booking.driver.rating,
                },
                eta: booking.status === 'ON_THE_WAY' ? '15 min' : null,
            });
        }
        catch (error) {
            return (0, response_1.sendError)(res, 'Failed to fetch tracking', 500);
        }
    }
    async cancelShift(req, res) {
        try {
            const { id } = req.params;
            const booking = await this.shiftBookingRepo.findOne({
                where: [{ id }, { bookingId: id }],
            });
            if (!booking)
                return (0, response_1.sendError)(res, 'Booking not found', 404);
            if (booking.userId !== req.user.id)
                return (0, response_1.sendError)(res, 'Unauthorized', 403);
            if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
                return (0, response_1.sendError)(res, 'Cannot cancel this booking', 400);
            }
            booking.status = 'CANCELLED';
            await this.shiftBookingRepo.save(booking);
            if (booking.driverId) {
                await this.driverRepo.update(booking.driverId, { isAvailable: true });
            }
            return (0, response_1.sendSuccess)(res, 'Shift booking cancelled');
        }
        catch (error) {
            return (0, response_1.sendError)(res, 'Failed to cancel shift', 500);
        }
    }
    async getVehicles(req, res) {
        try {
            const vehicles = await this.fareService.getAllVehicles();
            return (0, response_1.sendSuccess)(res, 'Vehicles fetched', vehicles.map((v) => ({
                vehicleType: v.vehicleType,
                displayName: v.displayName,
                baseFare: v.baseFare,
                baseFareFormatted: `NPR ${Number(v.baseFare).toLocaleString('en-US')}`,
                helperRate: v.helperRate,
                description: v.description,
            })));
        }
        catch (error) {
            return (0, response_1.sendError)(res, 'Failed to fetch vehicles', 500);
        }
    }
    formatShift(b) {
        return {
            id: b.id,
            bookingId: b.bookingId,
            status: b.status,
            fromLocation: b.fromLocation,
            toLocation: b.toLocation,
            moveDate: b.moveDate,
            helpers: b.helpers,
            fare: {
                base: `NPR ${Number(b.baseFare).toLocaleString('en-US')}`,
                helpers: `NPR ${Number(b.helpersCost).toLocaleString('en-US')}`,
                service: `NPR ${Number(b.serviceFee).toLocaleString('en-US')}`,
                total: `NPR ${Number(b.totalFare).toLocaleString('en-US')}`,
            },
            vehicle: b.vehicle ? { type: b.vehicle.vehicleType, name: b.vehicle.displayName } : null,
            driver: b.driver ? {
                id: b.driver.id,
                name: b.driver.user ? `${b.driver.user.firstName} ${b.driver.user.lastName}` : null,
                rating: b.driver.rating,
                plateNumber: b.driver.plateNumber,
            } : null,
            createdAt: b.createdAt,
        };
    }
}
exports.ShiftBookingController = ShiftBookingController;
//# sourceMappingURL=ShiftBookingController.js.map