import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import { jwtConfig } from '../config/database';
import jwt from 'jsonwebtoken';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  // Register new user
  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone, role } = req.body;

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        return sendError(res, 'User already exists', 409);
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

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

      Logger.info(`User registered: ${email}`);
      return sendSuccess(res, 'User registered successfully', { id: user.id, email: user.email }, 201);
    } catch (error) {
      Logger.error('Registration error', error);
      return sendError(res, 'Registration failed', 500, error);
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return sendError(res, 'Invalid credentials', 401);
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return sendError(res, 'Invalid credentials', 401);
      }

      // Generate JWT token
      const secret = jwtConfig.secret as string;
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        secret,
        { expiresIn: '7d' }
      );

      Logger.info(`User logged in: ${email}`);
      return sendSuccess(res, 'Login successful', { token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
      Logger.error('Login error', error);
      return sendError(res, 'Login failed', 500, error);
    }
  }

  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await this.userRepository.findAndCount({
        skip,
        take: limit,
        select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'createdAt'],
      });

      return sendSuccess(res, 'Users fetched successfully', {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      Logger.error('Get users error', error);
      return sendError(res, 'Failed to fetch users', 500, error);
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      return sendSuccess(res, 'User fetched successfully', user);
    } catch (error) {
      Logger.error('Get user error', error);
      return sendError(res, 'Failed to fetch user', 500, error);
    }
  }

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { firstName, lastName, phone, role } = req.body;

      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.phone = phone || user.phone;
      if (role) user.role = role;

      await this.userRepository.save(user);

      Logger.info(`User updated: ${id}`);
      return sendSuccess(res, 'User updated successfully', user);
    } catch (error) {
      Logger.error('Update user error', error);
      return sendError(res, 'Failed to update user', 500, error);
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      await this.userRepository.remove(user);

      Logger.info(`User deleted: ${id}`);
      return sendSuccess(res, 'User deleted successfully');
    } catch (error) {
      Logger.error('Delete user error', error);
      return sendError(res, 'Failed to delete user', 500, error);
    }
  }
}
