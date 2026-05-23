import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { ShiftBooking } from '../models/ShiftBooking';
import { Driver } from '../models/Driver';
import { Vehicle } from '../models/Vehicle';
import { FareCalculatorService } from '../services/FareCalculatorService';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

export class ShiftBookingController {
  private shiftBookingRepo = AppDataSource.getRepository(ShiftBooking);
  private driverRepo = AppDataSource.getRepository(Driver);
  private vehicleRepo = AppDataSource.getRepository(Vehicle);
  private fareService = new FareCalculatorService();

  private async generateBookingId(): Promise<string> {
    const last = await this.shiftBookingRepo
      .createQueryBuilder('sb')
      .select('MAX(CAST(SUBSTRING(sb.bookingId, 3) AS INTEGER))', 'max')
      .getRawOne();
    const next = (last?.max || 0) + 1;
    return `SH${next.toString().padStart(5, '0')}`;
  }

  async estimate(req: Request, res: Response) {
    try {
      const { vehicleType, helpers = 0 } = req.body;
      if (!vehicleType) return sendError(res, 'vehicleType is required', 400);

      const breakdown = await this.fareService.estimate(vehicleType, Number(helpers));
      return sendSuccess(res, 'Fare estimated', {
        ...breakdown,
        formatted: {
          baseFare: `NPR ${breakdown.baseFare.toLocaleString('en-US')}`,
          helpersCost: `NPR ${breakdown.helpersCost.toLocaleString('en-US')}`,
          serviceFee: `NPR ${breakdown.serviceFee.toLocaleString('en-US')}`,
          totalFare: `NPR ${breakdown.totalFare.toLocaleString('en-US')}`,
        },
      });
    } catch (error: any) {
      Logger.error('Fare estimate error', error);
      return sendError(res, error.message || 'Failed to estimate fare', 400);
    }
  }

  async book(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { vehicleType, fromLocation, toLocation, moveDate, helpers = 0, notes } = req.body;

      if (!vehicleType || !fromLocation || !toLocation || !moveDate) {
        return sendError(res, 'vehicleType, fromLocation, toLocation, moveDate are required', 400);
      }

      const vehicle = await this.vehicleRepo.findOne({
        where: { vehicleType: vehicleType.toUpperCase(), isActive: true },
      });
      if (!vehicle) return sendError(res, 'Invalid vehicle type', 400);

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
      Logger.info(`Shift booked: ${bookingId} by ${userId}`);

      return sendSuccess(res, 'Shift booked successfully', {
        bookingId: booking.bookingId,
        status: booking.status,
        totalFare: `NPR ${booking.totalFare.toLocaleString('en-US')}`,
        driver: driver ? { id: driver.id, rating: driver.rating, plateNumber: driver.plateNumber } : null,
        message: driver ? 'Driver assigned' : 'Booking confirmed, driver will be assigned shortly',
      }, 201);
    } catch (error) {
      Logger.error('Book shift error', error);
      return sendError(res, 'Failed to book shift', 500);
    }
  }

  async getMyShifts(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
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

      return sendSuccess(res, 'Shift bookings fetched', {
        bookings: bookings.map((b) => this.formatShift(b)),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      Logger.error('Get my shifts error', error);
      return sendError(res, 'Failed to fetch shifts', 500);
    }
  }

  async getShiftById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await this.shiftBookingRepo
        .createQueryBuilder('sb')
        .leftJoinAndSelect('sb.vehicle', 'vehicle')
        .leftJoinAndSelect('sb.driver', 'driver')
        .leftJoinAndSelect('driver.user', 'driverUser')
        .where('sb.id = :id OR sb.bookingId = :id', { id })
        .getOne();

      if (!booking) return sendError(res, 'Shift booking not found', 404);
      if (booking.userId !== req.user!.id && req.user!.role !== 'admin') {
        return sendError(res, 'Unauthorized', 403);
      }

      return sendSuccess(res, 'Shift booking fetched', this.formatShift(booking));
    } catch (error) {
      return sendError(res, 'Failed to fetch shift', 500);
    }
  }

  async trackShift(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await this.shiftBookingRepo
        .createQueryBuilder('sb')
        .leftJoinAndSelect('sb.driver', 'driver')
        .where('sb.id = :id OR sb.bookingId = :id', { id })
        .getOne();

      if (!booking) return sendError(res, 'Shift not found', 404);
      if (!booking.driver) return sendError(res, 'Driver not yet assigned', 404);

      return sendSuccess(res, 'Tracking info fetched', {
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
    } catch (error) {
      return sendError(res, 'Failed to fetch tracking', 500);
    }
  }

  async cancelShift(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const booking = await this.shiftBookingRepo.findOne({
        where: [{ id }, { bookingId: id }],
      });

      if (!booking) return sendError(res, 'Booking not found', 404);
      if (booking.userId !== req.user!.id) return sendError(res, 'Unauthorized', 403);
      if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
        return sendError(res, 'Cannot cancel this booking', 400);
      }

      booking.status = 'CANCELLED';
      await this.shiftBookingRepo.save(booking);

      if (booking.driverId) {
        await this.driverRepo.update(booking.driverId, { isAvailable: true });
      }

      return sendSuccess(res, 'Shift booking cancelled');
    } catch (error) {
      return sendError(res, 'Failed to cancel shift', 500);
    }
  }

  async getVehicles(req: Request, res: Response) {
    try {
      const vehicles = await this.fareService.getAllVehicles();
      return sendSuccess(res, 'Vehicles fetched', vehicles.map((v) => ({
        vehicleType: v.vehicleType,
        displayName: v.displayName,
        baseFare: v.baseFare,
        baseFareFormatted: `NPR ${Number(v.baseFare).toLocaleString('en-US')}`,
        helperRate: v.helperRate,
        description: v.description,
      })));
    } catch (error) {
      return sendError(res, 'Failed to fetch vehicles', 500);
    }
  }

  private formatShift(b: ShiftBooking) {
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