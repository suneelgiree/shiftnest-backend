"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const data_source_1 = require("../database/data-source");
const User_1 = require("../models/User");
const response_1 = require("../utils/response");
const logger_1 = require("../utils/logger");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
class AuthController {
    constructor() {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
    }
    signAccess(user) {
        return jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    }
    signRefresh(user) {
        return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    }
    async register(req, res) {
        try {
            const { email, password, firstName, lastName, phone, role } = req.body;
            if (!email || !password || !firstName || !lastName) {
                return (0, response_1.sendError)(res, 'email, password, firstName, lastName are required', 400);
            }
            const existing = await this.userRepository.findOne({ where: { email } });
            if (existing)
                return (0, response_1.sendError)(res, 'Email already registered', 409);
            const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            const hashedPassword = await bcryptjs_1.default.hash(password, rounds);
            const allowedRoles = ['user', 'owner'];
            const assignedRole = allowedRoles.includes(role) ? role : 'user';
            const user = this.userRepository.create({
                email, password: hashedPassword,
                firstName, lastName, phone, role: assignedRole,
            });
            await this.userRepository.save(user);
            const accessToken = this.signAccess(user);
            const refreshToken = this.signRefresh(user);
            logger_1.Logger.info(`User registered: ${email}`);
            return (0, response_1.sendSuccess)(res, 'Registration successful', {
                accessToken, refreshToken,
                user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
            }, 201);
        }
        catch (error) {
            logger_1.Logger.error('Register error', error);
            return (0, response_1.sendError)(res, 'Registration failed', 500);
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password)
                return (0, response_1.sendError)(res, 'Email and password required', 400);
            const user = await this.userRepository.findOne({ where: { email } });
            if (!user)
                return (0, response_1.sendError)(res, 'Invalid credentials', 401);
            const valid = await bcryptjs_1.default.compare(password, user.password);
            if (!valid)
                return (0, response_1.sendError)(res, 'Invalid credentials', 401);
            const accessToken = this.signAccess(user);
            const refreshToken = this.signRefresh(user);
            logger_1.Logger.info(`User logged in: ${email}`);
            return (0, response_1.sendSuccess)(res, 'Login successful', {
                accessToken, refreshToken,
                user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, phone: user.phone },
            });
        }
        catch (error) {
            logger_1.Logger.error('Login error', error);
            return (0, response_1.sendError)(res, 'Login failed', 500);
        }
    }
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken)
                return (0, response_1.sendError)(res, 'Refresh token required', 400);
            const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await this.userRepository.findOne({ where: { id: payload.id } });
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 404);
            const newAccess = this.signAccess(user);
            const newRefresh = this.signRefresh(user);
            return (0, response_1.sendSuccess)(res, 'Token refreshed', { accessToken: newAccess, refreshToken: newRefresh });
        }
        catch (error) {
            return (0, response_1.sendError)(res, 'Invalid refresh token', 401);
        }
    }
    async getMe(req, res) {
        try {
            const user = await this.userRepository.findOne({
                where: { id: req.user.id },
                select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'createdAt'],
            });
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 404);
            return (0, response_1.sendSuccess)(res, 'Profile fetched', user);
        }
        catch (error) {
            return (0, response_1.sendError)(res, 'Failed to fetch profile', 500);
        }
    }
    async updateMe(req, res) {
        try {
            const { firstName, lastName, phone } = req.body;
            const user = await this.userRepository.findOne({ where: { id: req.user.id } });
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 404);
            if (firstName)
                user.firstName = firstName;
            if (lastName)
                user.lastName = lastName;
            if (phone)
                user.phone = phone;
            await this.userRepository.save(user);
            return (0, response_1.sendSuccess)(res, 'Profile updated', {
                id: user.id, email: user.email,
                firstName: user.firstName, lastName: user.lastName, phone: user.phone,
            });
        }
        catch (error) {
            return (0, response_1.sendError)(res, 'Failed to update profile', 500);
        }
    }
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword)
                return (0, response_1.sendError)(res, 'Both passwords required', 400);
            if (newPassword.length < 8)
                return (0, response_1.sendError)(res, 'New password must be at least 8 characters', 400);
            const user = await this.userRepository.findOne({ where: { id: req.user.id } });
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 404);
            const valid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!valid)
                return (0, response_1.sendError)(res, 'Current password is incorrect', 400);
            const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
            user.password = await bcryptjs_1.default.hash(newPassword, rounds);
            await this.userRepository.save(user);
            return (0, response_1.sendSuccess)(res, 'Password changed successfully');
        }
        catch (error) {
            return (0, response_1.sendError)(res, 'Failed to change password', 500);
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map