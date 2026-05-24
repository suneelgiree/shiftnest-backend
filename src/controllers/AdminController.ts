import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { User } from '../models/User';
import { Room } from '../models/Room';
import { RoomBooking } from '../models/RoomBooking';
import { ShiftBooking } from '../models/ShiftBooking';
import { Driver } from '../models/Driver';
import { Vehicle } from '../models/Vehicle';
import { Payment } from '../models/Payment';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

export class AdminController {
  private userRepo = AppDataSource.getRepository(User);
  private roomRepo = AppDataSource.getRepository(Room);
  private roomBookingRepo = AppDataSource.getRepository(RoomBooking);
  private shiftBookingRepo = AppDataSource.getRepository(ShiftBooking);
  private driverRepo = AppDataSource.getRepository(Driver);
  private vehicleRepo = AppDataSource.getRepository(Vehicle);
  private paymentRepo = AppDataSource.getRepository(Payment);

  // GET /api/admin/dashboard
  async getDashboard(req: Request, res: Response) {
    try {
      const [
        totalUsers,
        totalRooms,
        totalRoomBookings,
        totalShiftBookings,
        totalDrivers,
      ] = await Promise.all([
        this.userRepo.count(),
        this.roomRepo.count(),
        this.roomBookingRepo.count(),
        this.shiftBookingRepo.count(),
        this.driverRepo.count(),
      ]);

      const revenueResult = await this.paymentRepo
        .createQueryBuilder('p')
        .select('SUM(p.amount)', 'total')
        .where('p.status = :status', { status: 'COMPLETED' })
        .getRawOne();

      const revenue = parseFloat(revenueResult?.total || '0');

      const recentBookings = await this.roomBookingRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.room', 'room')
        .leftJoinAndSelect('b.user', 'user')
        .orderBy('b.bookingDate', 'DESC')
        .take(5)
        .getMany();

      return sendSuccess(res, 'Dashboard fetched', {
        stats: {
          totalUsers,
          totalRooms,
          totalRoomBookings,
          totalShiftBookings,
          totalDrivers,
          totalRevenue: `NPR ${revenue.toLocaleString('en-US')}`,
        },
        recentBookings: recentBookings.map((b) => ({
          bookingId: b.bookingId,
          status: b.status,
          amount: `NPR ${Number(b.bookingFee).toLocaleString('en-US')}`,
          room: b.room?.title,
          user: `${b.user?.firstName} ${b.user?.lastName}`,
          date: b.bookingDate,
        })),
      });
    } catch (error) {
      Logger.error('Dashboard error', error);
      return sendError(res, 'Failed to fetch dashboard', 500);
    }
  }

  // GET /api/admin/users
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const role = req.query.role as string;
      const skip = (page - 1) * limit;

      let query = this.userRepo.createQueryBuilder('u');
      if (role) query = query.where('u.role = :role', { role });

      const [users, total] = await query
        .select(['u.id', 'u.email', 'u.firstName', 'u.lastName', 'u.phone', 'u.role', 'u.createdAt'])
        .orderBy('u.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return sendSuccess(res, 'Users fetched', {
        users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      return sendError(res, 'Failed to fetch users', 500);
    }
  }

  // PUT /api/admin/users/:id/role
  async updateUserRole(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const allowedRoles = ['user', 'owner', 'driver', 'admin'];
      if (!allowedRoles.includes(role)) {
        return sendError(res, `Role must be one of: ${allowedRoles.join(', ')}`, 400);
      }

      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) return sendError(res, 'User not found', 404);

      user.role = role;
      await this.userRepo.save(user);

      Logger.info(`Admin updated user ${id} role to ${role}`);
      return sendSuccess(res, 'User role updated', { id: user.id, email: user.email, role: user.role });
    } catch (error) {
      return sendError(res, 'Failed to update user role', 500);
    }
  }

  // DELETE /api/admin/users/:id
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (id === req.user!.id) return sendError(res, 'Cannot delete yourself', 400);

      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) return sendError(res, 'User not found', 404);

      await this.userRepo.remove(user);
      Logger.info(`Admin deleted user ${id}`);
      return sendSuccess(res, 'User deleted');
    } catch (error) {
      return sendError(res, 'Failed to delete user', 500);
    }
  }

  // GET /api/admin/rooms
  async getAllRooms(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const [rooms, total] = await this.roomRepo
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.owner', 'owner')
        .orderBy('r.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return sendSuccess(res, 'Rooms fetched', {
        rooms: rooms.map((r) => ({
          id: r.id,
          title: r.title,
          price: `NPR ${Number(r.price).toLocaleString('en-US')}`,
          location: r.location,
          city: r.city,
          roomType: r.roomType,
          isVerified: r.isVerified,
          isActive: r.isActive,
          owner: `${r.owner?.firstName} ${r.owner?.lastName}`,
          createdAt: r.createdAt,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      return sendError(res, 'Failed to fetch rooms', 500);
    }
  }

  // PUT /api/admin/rooms/:id/verify
  async verifyRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const room = await this.roomRepo.findOne({ where: { id } });
      if (!room) return sendError(res, 'Room not found', 404);

      room.isVerified = true;
      await this.roomRepo.save(room);

      Logger.info(`Admin verified room ${id}`);
      return sendSuccess(res, 'Room verified successfully', { id: room.id, isVerified: true });
    } catch (error) {
      return sendError(res, 'Failed to verify room', 500);
    }
  }

  // PUT /api/admin/rooms/:id/toggle
  async toggleRoom(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const room = await this.roomRepo.findOne({ where: { id } });
      if (!room) return sendError(res, 'Room not found', 404);

      room.isActive = !room.isActive;
      await this.roomRepo.save(room);

      return sendSuccess(res, `Room ${room.isActive ? 'activated' : 'deactivated'}`, {
        id: room.id, isActive: room.isActive,
      });
    } catch (error) {
      return sendError(res, 'Failed to toggle room', 500);
    }
  }

  // GET /api/admin/bookings
  async getAllBookings(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      let query = this.roomBookingRepo
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.room', 'room')
        .leftJoinAndSelect('b.user', 'user');

      if (status) query = query.where('b.status = :status', { status });

      const [bookings, total] = await query
        .orderBy('b.bookingDate', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return sendSuccess(res, 'Bookings fetched', {
        bookings: bookings.map((b) => ({
          bookingId: b.bookingId,
          status: b.status,
          amount: `NPR ${Number(b.bookingFee).toLocaleString('en-US')}`,
          room: b.room?.title,
          user: `${b.user?.firstName} ${b.user?.lastName}`,
          date: b.bookingDate,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      return sendError(res, 'Failed to fetch bookings', 500);
    }
  }

  // PUT /api/admin/bookings/:id/status
  async updateBookingStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowed = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
      if (!allowed.includes(status)) {
        return sendError(res, `Status must be one of: ${allowed.join(', ')}`, 400);
      }

      const booking = await this.roomBookingRepo.findOne({ where: { id } });
      if (!booking) return sendError(res, 'Booking not found', 404);

      booking.status = status;
      if (status === 'CONFIRMED') booking.confirmedAt = new Date();
      await this.roomBookingRepo.save(booking);

      return sendSuccess(res, 'Booking status updated', { bookingId: booking.bookingId, status });
    } catch (error) {
      return sendError(res, 'Failed to update booking', 500);
    }
  }

  // GET /api/admin/shifts
  async getAllShiftBookings(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      let query = this.shiftBookingRepo
        .createQueryBuilder('sb')
        .leftJoinAndSelect('sb.user', 'user')
        .leftJoinAndSelect('sb.driver', 'driver')
        .leftJoinAndSelect('driver.user', 'driverUser')
        .leftJoinAndSelect('sb.vehicle', 'vehicle');

      if (status) query = query.where('sb.status = :status', { status });

      const [bookings, total] = await query
        .orderBy('sb.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return sendSuccess(res, 'Shift bookings fetched', {
        bookings: bookings.map((b) => ({
          bookingId: b.bookingId,
          status: b.status,
          from: b.fromLocation,
          to: b.toLocation,
          moveDate: b.moveDate,
          totalFare: `NPR ${Number(b.totalFare).toLocaleString('en-US')}`,
          vehicle: b.vehicle?.displayName,
          user: `${b.user?.firstName} ${b.user?.lastName}`,
          driver: b.driver ? `${b.driver.user?.firstName} ${b.driver.user?.lastName}` : 'Unassigned',
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      return sendError(res, 'Failed to fetch shift bookings', 500);
    }
  }

  // POST /api/admin/drivers
  async createDriver(req: Request, res: Response) {
    try {
      const { userId, vehicleType, plateNumber } = req.body;
      if (!userId || !vehicleType || !plateNumber) {
        return sendError(res, 'userId, vehicleType, plateNumber are required', 400);
      }

      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) return sendError(res, 'User not found', 404);

      const vehicle = await this.vehicleRepo.findOne({
        where: { vehicleType: vehicleType.toUpperCase() },
      });
      if (!vehicle) return sendError(res, 'Vehicle type not found', 404);

      // Update user role to driver
      user.role = 'driver';
      await this.userRepo.save(user);

      const driver = this.driverRepo.create({
        userId, vehicleId: vehicle.id, plateNumber,
      });
      await this.driverRepo.save(driver);

      Logger.info(`Admin created driver for user ${userId}`);
      return sendSuccess(res, 'Driver created', {
        id: driver.id,
        user: `${user.firstName} ${user.lastName}`,
        vehicle: vehicle.displayName,
        plateNumber,
      }, 201);
    } catch (error) {
      return sendError(res, 'Failed to create driver', 500);
    }
  }

  // GET /api/admin/drivers
  async getAllDrivers(req: Request, res: Response) {
    try {
      const drivers = await this.driverRepo
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.user', 'user')
        .leftJoinAndSelect('d.vehicle', 'vehicle')
        .orderBy('d.createdAt', 'DESC')
        .getMany();

      return sendSuccess(res, 'Drivers fetched', drivers.map((d) => ({
        id: d.id,
        name: `${d.user?.firstName} ${d.user?.lastName}`,
        phone: d.user?.phone,
        vehicle: d.vehicle?.displayName,
        plateNumber: d.plateNumber,
        rating: d.rating,
        totalRatings: d.totalRatings,
        isAvailable: d.isAvailable,
      })));
    } catch (error) {
      return sendError(res, 'Failed to fetch drivers', 500);
    }
  }

  // PUT /api/admin/shifts/:id/assign
  async assignDriver(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { driverId } = req.body;
      if (!driverId) return sendError(res, 'driverId is required', 400);

      const booking = await this.shiftBookingRepo.findOne({ where: { id } });
      if (!booking) return sendError(res, 'Shift booking not found', 404);

      const driver = await this.driverRepo.findOne({ where: { id: driverId } });
      if (!driver) return sendError(res, 'Driver not found', 404);
      if (!driver.isAvailable) return sendError(res, 'Driver is not available', 400);

      booking.driverId = driverId;
      booking.status = 'CONFIRMED';
      await this.shiftBookingRepo.save(booking);

      driver.isAvailable = false;
      await this.driverRepo.save(driver);

      Logger.info(`Admin assigned driver ${driverId} to shift ${id}`);
      return sendSuccess(res, 'Driver assigned successfully', {
        bookingId: booking.bookingId, driverId, status: 'CONFIRMED',
      });
    } catch (error) {
      return sendError(res, 'Failed to assign driver', 500);
    }
  }
}

