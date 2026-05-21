"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const data_source_1 = require("../database/data-source");
const User_1 = require("../models/User");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = require("../config/database");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class UserController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    // Register new user
    async register(req, res) {
        try {
            const { email, password, firstName, lastName, phone, role } = req.body;
            // Check if user already exists
            const existingUser = await this.userRepository.findOne({ where: { email } });
            if (existingUser) {
                return (0, response_1.sendError)(res, 'User already exists', 409);
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Create new user
            const user = this.userRepository.create({
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role: role || 'employee',
            });
            await this.userRepository.save(user);
            logger_1.Logger.info(`User registered: ${email}`);
            return (0, response_1.sendSuccess)(res, 'User registered successfully', { id: user.id, email: user.email }, 201);
        }
        catch (error) {
            logger_1.Logger.error('Registration error', error);
            return (0, response_1.sendError)(res, 'Registration failed', 500, error);
        }
    }
    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user) {
                return (0, response_1.sendError)(res, 'Invalid credentials', 401);
            }
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return (0, response_1.sendError)(res, 'Invalid credentials', 401);
            }
            // Generate JWT token
            const secret = database_1.jwtConfig.secret;
            if (!secret) {
                throw new Error('JWT_SECRET is not configured');
            }
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, secret, { expiresIn: '7d' });
            logger_1.Logger.info(`User logged in: ${email}`);
            return (0, response_1.sendSuccess)(res, 'Login successful', { token, user: { id: user.id, email: user.email, role: user.role } });
        }
        catch (error) {
            logger_1.Logger.error('Login error', error);
            return (0, response_1.sendError)(res, 'Login failed', 500, error);
        }
    }
    // Get all users
    async getAllUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const [users, total] = await this.userRepository.findAndCount({
                skip,
                take: limit,
                select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'createdAt'],
            });
            return (0, response_1.sendSuccess)(res, 'Users fetched successfully', {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            logger_1.Logger.error('Get users error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch users', 500, error);
        }
    }
    // Get user by ID
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                return (0, response_1.sendError)(res, 'User not found', 404);
            }
            return (0, response_1.sendSuccess)(res, 'User fetched successfully', user);
        }
        catch (error) {
            logger_1.Logger.error('Get user error', error);
            return (0, response_1.sendError)(res, 'Failed to fetch user', 500, error);
        }
    }
    // Update user
    async updateUser(req, res) {
        try {
            const { id } = req.params;
            const { firstName, lastName, phone, role } = req.body;
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                return (0, response_1.sendError)(res, 'User not found', 404);
            }
            user.firstName = firstName || user.firstName;
            user.lastName = lastName || user.lastName;
            user.phone = phone || user.phone;
            if (role)
                user.role = role;
            await this.userRepository.save(user);
            logger_1.Logger.info(`User updated: ${id}`);
            return (0, response_1.sendSuccess)(res, 'User updated successfully', user);
        }
        catch (error) {
            logger_1.Logger.error('Update user error', error);
            return (0, response_1.sendError)(res, 'Failed to update user', 500, error);
        }
    }
    // Delete user
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                return (0, response_1.sendError)(res, 'User not found', 404);
            }
            await this.userRepository.remove(user);
            logger_1.Logger.info(`User deleted: ${id}`);
            return (0, response_1.sendSuccess)(res, 'User deleted successfully');
        }
        catch (error) {
            logger_1.Logger.error('Delete user error', error);
            return (0, response_1.sendError)(res, 'Failed to delete user', 500, error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map