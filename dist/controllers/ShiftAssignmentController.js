"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftAssignmentController = void 0;
const data_source_1 = require("../database/data-source");
const ShiftAssignment_1 = require("../models/ShiftAssignment");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class ShiftAssignmentController {
    constructor() {
        this.assignmentRepository = data_source_1.AppDataSource.getRepository(ShiftAssignment_1.ShiftAssignment);
    }
    // Assign user to shift
    async assignShift(req, res) {
        try {
            const { userId, shiftId, notes } = req.body;
            // Check if assignment already exists
            const existingAssignment = await this.assignmentRepository.findOne({
                where: { userId, shiftId },
            });
            if (existingAssignment) {
                return (0, response_1.sendError)(res, 'User already assigned to this shift', 409);
            }
            const assignment = this.assignmentRepository.create({
                userId,
                shiftId,
                notes,
                status: 'pending',
            });
            await this.assignmentRepository.save(assignment);
            logger_1.Logger.info(`Assignment created: ${assignment.id}`);
            return (0, response_1.sendSuccess)(res, 'User assigned to shift successfully', assignment, 201);
        }
        catch (error) {
            logger_1.Logger.error('Assign shift error', error);
            return (0, response_1.sendError)(res, 'Failed to assign shift', 500, error);
        }
    }
    // Get all assignments
    async getAllAssignments(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const status = req.query.status;
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
            return (0, response_1.sendSuccess)(res, 'Assignments fetched successfully', {
                assignments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            logger_1.Logger.error('Get assignments error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch assignments', 500, error);
        }
    }
    // Get assignment by ID
    async getAssignmentById(req, res) {
        try {
            const { id } = req.params;
            const assignment = await this.assignmentRepository.findOne({
                where: { id },
                relations: ['user', 'shift'],
            });
            if (!assignment) {
                return (0, response_1.sendError)(res, 'Assignment not found', 404);
            }
            return (0, response_1.sendSuccess)(res, 'Assignment fetched successfully', assignment);
        }
        catch (error) {
            logger_1.Logger.error('Get assignment error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch assignment', 500, error);
        }
    }
    // Update assignment status
    async updateAssignmentStatus(req, res) {
        try {
            const { id } = req.params;
            const { status, notes } = req.body;
            const assignment = await this.assignmentRepository.findOne({ where: { id } });
            if (!assignment) {
                return (0, response_1.sendError)(res, 'Assignment not found', 404);
            }
            if (status)
                assignment.status = status;
            if (notes)
                assignment.notes = notes;
            await this.assignmentRepository.save(assignment);
            logger_1.Logger.info(`Assignment updated: ${id}`);
            return (0, response_1.sendSuccess)(res, 'Assignment updated successfully', assignment);
        }
        catch (error) {
            logger_1.Logger.error('Update assignment error', error);
            return (0, response_1.sendError)(res, 'Failed to update assignment', 500, error);
        }
    }
    // Get assignments by user
    async getAssignmentsByUser(req, res) {
        try {
            const { userId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const [assignments, total] = await this.assignmentRepository.findAndCount({
                where: { userId },
                relations: ['shift'],
                skip,
                take: limit,
            });
            return (0, response_1.sendSuccess)(res, 'User assignments fetched successfully', {
                assignments,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            logger_1.Logger.error('Get user assignments error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch user assignments', 500, error);
        }
    }
    // Cancel assignment
    async cancelAssignment(req, res) {
        try {
            const { id } = req.params;
            const assignment = await this.assignmentRepository.findOne({ where: { id } });
            if (!assignment) {
                return (0, response_1.sendError)(res, 'Assignment not found', 404);
            }
            assignment.status = 'cancelled';
            await this.assignmentRepository.save(assignment);
            logger_1.Logger.info(`Assignment cancelled: ${id}`);
            return (0, response_1.sendSuccess)(res, 'Assignment cancelled successfully', assignment);
        }
        catch (error) {
            logger_1.Logger.error('Cancel assignment error', error);
            return (0, response_1.sendError)(res, 'Failed to cancel assignment', 500, error);
        }
    }
}
exports.ShiftAssignmentController = ShiftAssignmentController;
//# sourceMappingURL=ShiftAssignmentController.js.map