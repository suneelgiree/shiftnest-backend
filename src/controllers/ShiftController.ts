import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Shift } from '../models/Shift';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

export class ShiftController {
  private shiftRepository = AppDataSource.getRepository(Shift);

  // Create shift
  async createShift(req: Request, res: Response) {
    try {
      const { title, startTime, endTime, date, description, requiredStaff, createdById } = req.body;

      const shift = this.shiftRepository.create({
        title,
        startTime,
        endTime,
        date,
        description,
        requiredStaff: requiredStaff || 1,
        createdById,
      });

      await this.shiftRepository.save(shift);

      Logger.info(`Shift created: ${shift.id}`);
      return sendSuccess(res, 'Shift created successfully', shift, 201);
    } catch (error) {
      Logger.error('Create shift error', error);
      return sendError(res, 'Failed to create shift', 500, error);
    }
  }

  // Get all shifts
  async getAllShifts(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const date = req.query.date as string;
      const skip = (page - 1) * limit;

      let query = this.shiftRepository.createQueryBuilder('shift').leftJoinAndSelect('shift.createdBy', 'createdBy');

      if (date) {
        query = query.where('shift.date = :date', { date });
      }

      const [shifts, total] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return sendSuccess(res, 'Shifts fetched successfully', {
        shifts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      Logger.error('Get shifts error', error);
      return sendError(res, 'Failed to fetch shifts', 500, error);
    }
  }

  // Get shift by ID
  async getShiftById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const shift = await this.shiftRepository.findOne({
        where: { id },
        relations: ['createdBy', 'assignments'],
      });

      if (!shift) {
        return sendError(res, 'Shift not found', 404);
      }

      return sendSuccess(res, 'Shift fetched successfully', shift);
    } catch (error) {
      Logger.error('Get shift error', error);
      return sendError(res, 'Failed to fetch shift', 500, error);
    }
  }

  // Update shift
  async updateShift(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, startTime, endTime, date, description, requiredStaff } = req.body;

      const shift = await this.shiftRepository.findOne({ where: { id } });
      if (!shift) {
        return sendError(res, 'Shift not found', 404);
      }

      shift.title = title || shift.title;
      shift.startTime = startTime || shift.startTime;
      shift.endTime = endTime || shift.endTime;
      shift.date = date || shift.date;
      shift.description = description || shift.description;
      shift.requiredStaff = requiredStaff || shift.requiredStaff;

      await this.shiftRepository.save(shift);

      Logger.info(`Shift updated: ${id}`);
      return sendSuccess(res, 'Shift updated successfully', shift);
    } catch (error) {
      Logger.error('Update shift error', error);
      return sendError(res, 'Failed to update shift', 500, error);
    }
  }

  // Delete shift
  async deleteShift(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const shift = await this.shiftRepository.findOne({ where: { id } });
      if (!shift) {
        return sendError(res, 'Shift not found', 404);
      }

      await this.shiftRepository.remove(shift);

      Logger.info(`Shift deleted: ${id}`);
      return sendSuccess(res, 'Shift deleted successfully');
    } catch (error) {
      Logger.error('Delete shift error', error);
      return sendError(res, 'Failed to delete shift', 500, error);
    }
  }
}
