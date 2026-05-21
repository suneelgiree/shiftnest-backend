import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { ShiftAssignment } from '../models/ShiftAssignment';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

export class ShiftAssignmentController {
  private assignmentRepository = AppDataSource.getRepository(ShiftAssignment);

  // Assign user to shift
  async assignShift(req: Request, res: Response) {
    try {
      const { userId, shiftId, notes } = req.body;

      // Check if assignment already exists
      const existingAssignment = await this.assignmentRepository.findOne({
        where: { userId, shiftId },
      });

      if (existingAssignment) {
        return sendError(res, 'User already assigned to this shift', 409);
      }

      const assignment = this.assignmentRepository.create({
        userId,
        shiftId,
        notes,
        status: 'pending',
      });

      await this.assignmentRepository.save(assignment);

      Logger.info(`Assignment created: ${assignment.id}`);
      return sendSuccess(res, 'User assigned to shift successfully', assignment, 201);
    } catch (error) {
      Logger.error('Assign shift error', error);
      return sendError(res, 'Failed to assign shift', 500, error);
    }
  }

  // Get all assignments
  async getAllAssignments(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;
      const skip = (page - 1) * limit;

      let query = this.assignmentRepository
        .createQueryBuilder('assignment')
        .leftJoinAndSelect('assignment.user', 'user')
        .leftJoinAndSelect('assignment.shift', 'shift');

      if (status) {
        query = query.where('assignment.status = :status', { status });
      }

      const [assignments, total] = await query
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return sendSuccess(res, 'Assignments fetched successfully', {
        assignments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      Logger.error('Get assignments error', error);
      return sendError(res, 'Failed to fetch assignments', 500, error);
    }
  }

  // Get assignment by ID
  async getAssignmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const assignment = await this.assignmentRepository.findOne({
        where: { id },
        relations: ['user', 'shift'],
      });

      if (!assignment) {
        return sendError(res, 'Assignment not found', 404);
      }

      return sendSuccess(res, 'Assignment fetched successfully', assignment);
    } catch (error) {
      Logger.error('Get assignment error', error);
      return sendError(res, 'Failed to fetch assignment', 500, error);
    }
  }

  // Update assignment status
  async updateAssignmentStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const assignment = await this.assignmentRepository.findOne({ where: { id } });
      if (!assignment) {
        return sendError(res, 'Assignment not found', 404);
      }

      if (status) assignment.status = status;
      if (notes) assignment.notes = notes;

      await this.assignmentRepository.save(assignment);

      Logger.info(`Assignment updated: ${id}`);
      return sendSuccess(res, 'Assignment updated successfully', assignment);
    } catch (error) {
      Logger.error('Update assignment error', error);
      return sendError(res, 'Failed to update assignment', 500, error);
    }
  }

  // Get assignments by user
  async getAssignmentsByUser(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [assignments, total] = await this.assignmentRepository.findAndCount({
        where: { userId },
        relations: ['shift'],
        skip,
        take: limit,
      });

      return sendSuccess(res, 'User assignments fetched successfully', {
        assignments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      Logger.error('Get user assignments error', error);
      return sendError(res, 'Failed to fetch user assignments', 500, error);
    }
  }

  // Cancel assignment
  async cancelAssignment(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const assignment = await this.assignmentRepository.findOne({ where: { id } });
      if (!assignment) {
        return sendError(res, 'Assignment not found', 404);
      }

      assignment.status = 'cancelled';
      await this.assignmentRepository.save(assignment);

      Logger.info(`Assignment cancelled: ${id}`);
      return sendSuccess(res, 'Assignment cancelled successfully', assignment);
    } catch (error) {
      Logger.error('Cancel assignment error', error);
      return sendError(res, 'Failed to cancel assignment', 500, error);
    }
  }
}
