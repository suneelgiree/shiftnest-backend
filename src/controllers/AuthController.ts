import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';
import bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  private signAccess(user: User) {
    return jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn:'15m' }
    );
  }

  private signRefresh(user: User) {
    return jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn:'7d' }
    );
  }

  async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone, role } = req.body;
      if (!email || !password || !firstName || !lastName) {
        return sendError(res, 'email, password, firstName, lastName are required', 400);
      }
      const existing = await this.userRepository.findOne({ where: { email } });
      if (existing) return sendError(res, 'Email already registered', 409);

      const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, rounds);
      const allowedRoles = ['user', 'owner'];
      const assignedRole = allowedRoles.includes(role) ? role : 'user';

      const user = this.userRepository.create({
        email, password: hashedPassword,
        firstName, lastName, phone, role: assignedRole,
      });
      await this.userRepository.save(user);

      const accessToken = this.signAccess(user);
      const refreshToken = this.signRefresh(user);

      Logger.info(`User registered: ${email}`);
      return sendSuccess(res, 'Registration successful', {
        accessToken, refreshToken,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      }, 201);
    } catch (error) {
      Logger.error('Register error', error);
      return sendError(res, 'Registration failed', 500);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) return sendError(res, 'Email and password required', 400);

      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) return sendError(res, 'Invalid credentials', 401);

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return sendError(res, 'Invalid credentials', 401);

      const accessToken = this.signAccess(user);
      const refreshToken = this.signRefresh(user);

      Logger.info(`User logged in: ${email}`);
      return sendSuccess(res, 'Login successful', {
        accessToken, refreshToken,
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role, phone: user.phone },
      });
    } catch (error) {
      Logger.error('Login error', error);
      return sendError(res, 'Login failed', 500);
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return sendError(res, 'Refresh token required', 400);

      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: string };
      const user = await this.userRepository.findOne({ where: { id: payload.id } });
      if (!user) return sendError(res, 'User not found', 404);

      const newAccess = this.signAccess(user);
      const newRefresh = this.signRefresh(user);
      return sendSuccess(res, 'Token refreshed', { accessToken: newAccess, refreshToken: newRefresh });
    } catch (error) {
      return sendError(res, 'Invalid refresh token', 401);
    }
  }

  async getMe(req: Request, res: Response) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: req.user!.id },
        select: ['id', 'email', 'firstName', 'lastName', 'phone', 'role', 'createdAt'],
      });
      if (!user) return sendError(res, 'User not found', 404);
      return sendSuccess(res, 'Profile fetched', user);
    } catch (error) {
      return sendError(res, 'Failed to fetch profile', 500);
    }
  }

  async updateMe(req: Request, res: Response) {
    try {
      const { firstName, lastName, phone } = req.body;
      const user = await this.userRepository.findOne({ where: { id: req.user!.id } });
      if (!user) return sendError(res, 'User not found', 404);

      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      if (phone) user.phone = phone;

      await this.userRepository.save(user);
      return sendSuccess(res, 'Profile updated', {
        id: user.id, email: user.email,
        firstName: user.firstName, lastName: user.lastName, phone: user.phone,
      });
    } catch (error) {
      return sendError(res, 'Failed to update profile', 500);
    }
  }

  async updateRole(req: Request, res: Response) {
    try {
      const { role } = req.body;
      const allowedRoles = ['user', 'owner']; // extend if Shifting is added
      if (!allowedRoles.includes(role)) {
        return sendError(res, `role must be one of: ${allowedRoles.join(', ')}`, 400);
      }
      const user = await this.userRepository.findOne({ where: { id: req.user!.id } });
      if (!user) return sendError(res, 'User not found', 404);

      user.role = role;
      await this.userRepository.save(user);

      // Re-issue tokens so the new role is reflected immediately.
      const accessToken = this.signAccess(user);
      const refreshToken = this.signRefresh(user);
      Logger.info(`Role switched: ${user.email} -> ${role}`);
      return sendSuccess(res, 'Role updated', {
        accessToken, refreshToken,
        user: {
          id: user.id, email: user.email,
          firstName: user.firstName, lastName: user.lastName,
          role: user.role, phone: user.phone,
        },
      });
    } catch (error) {
      Logger.error('Update role error', error);
      return sendError(res, 'Failed to update role', 500);
    }
  }

  async changePassword(req: Request, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) return sendError(res, 'Both passwords required', 400);
      if (newPassword.length < 8) return sendError(res, 'New password must be at least 8 characters', 400);

      const user = await this.userRepository.findOne({ where: { id: req.user!.id } });
      if (!user) return sendError(res, 'User not found', 404);

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) return sendError(res, 'Current password is incorrect', 400);

      const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      user.password = await bcrypt.hash(newPassword, rounds);
      await this.userRepository.save(user);
      return sendSuccess(res, 'Password changed successfully');
    } catch (error) {
      return sendError(res, 'Failed to change password', 500);
    }
  }
}