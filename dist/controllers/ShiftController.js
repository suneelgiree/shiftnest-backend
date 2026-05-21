"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShiftController = void 0;
const data_source_1 = require("../database/data-source");
const Shift_1 = require("../models/Shift");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
class ShiftController {
    constructor() {
        this.shiftRepository = data_source_1.AppDataSource.getRepository(Shift_1.Shift);
    }
    // Create shift
    async createShift(req, res) {
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
            logger_1.Logger.info(`Shift created: ${shift.id}`);
            return (0, response_1.sendSuccess)(res, 'Shift created successfully', shift, 201);
        }
        catch (error) {
            logger_1.Logger.error('Create shift error', error);
            return (0, response_1.sendError)(res, 'Failed to create shift', 500, error);
        }
    }
    // Get all shifts
    async getAllShifts(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const date = req.query.date;
            const skip = (page - 1) * limit;
            let query = this.shiftRepository.createQueryBuilder('shift').leftJoinAndSelect('shift.createdBy', 'createdBy');
            if (date) {
                query = query.where('shift.date = :date', { date });
            }
            const [shifts, total] = await query
                .skip(skip)
                .take(limit)
                .getManyAndCount();
            return (0, response_1.sendSuccess)(res, 'Shifts fetched successfully', {
                shifts,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            logger_1.Logger.error('Get shifts error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch shifts', 500, error);
        }
    }
    // Get shift by ID
    async getShiftById(req, res) {
        try {
            const { id } = req.params;
            const shift = await this.shiftRepository.findOne({
                where: { id },
                relations: ['createdBy', 'assignments'],
            });
            if (!shift) {
                return (0, response_1.sendError)(res, 'Shift not found', 404);
            }
            return (0, response_1.sendSuccess)(res, 'Shift fetched successfully', shift);
        }
        catch (error) {
            logger_1.Logger.error('Get shift error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch shift', 500, error);
        }
    }
    // Update shift
    async updateShift(req, res) {
        try {
            const { id } = req.params;
            const { title, startTime, endTime, date, description, requiredStaff } = req.body;
            const shift = await this.shiftRepository.findOne({ where: { id } });
            if (!shift) {
                return (0, response_1.sendError)(res, 'Shift not found', 404);
            }
            shift.title = title || shift.title;
            shift.startTime = startTime || shift.startTime;
            shift.endTime = endTime || shift.endTime;
            shift.date = date || shift.date;
            shift.description = description || shift.description;
            shift.requiredStaff = requiredStaff || shift.requiredStaff;
            await this.shiftRepository.save(shift);
            logger_1.Logger.info(`Shift updated: ${id}`);
            return (0, response_1.sendSuccess)(res, 'Shift updated successfully', shift);
        }
        catch (error) {
            logger_1.Logger.error('Update shift error', error);
            return (0, response_1.sendError)(res, 'Failed to update shift', 500, error);
        }
    }
    // Delete shift
    async deleteShift(req, res) {
        try {
            const { id } = req.params;
            const shift = await this.shiftRepository.findOne({ where: { id } });
            if (!shift) {
                return (0, response_1.sendError)(res, 'Shift not found', 404);
            }
            await this.shiftRepository.remove(shift);
            logger_1.Logger.info(`Shift deleted: ${id}`);
            return (0, response_1.sendSuccess)(res, 'Shift deleted successfully');
        }
        catch (error) {
            logger_1.Logger.error('Delete shift error', error);
            return (0, response_1.sendError)(res, 'Failed to delete shift', 500, error);
        }
    }
}
exports.ShiftController = ShiftController;
//# sourceMappingURL=ShiftController.js.map