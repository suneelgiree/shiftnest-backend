import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

const ACCESS_DAYS = 30;
const ACCESS_FEE = 500;

export function hasActiveAccess(user: { accessExpiresAt?: Date | null }): boolean {
  if (!user?.accessExpiresAt) return false;
  return new Date(user.accessExpiresAt).getTime() > Date.now();
}

export class SubscriptionController {
  private paymentRepo = AppDataSource.getRepository(Payment);
  private userRepo = AppDataSource.getRepository(User);

  // Current access status for the logged-in user.
  async status(req: Request, res: Response) {
    try {
      const user = await this.userRepo.findOne({ where: { id: req.user!.id } });
      if (!user) return sendError(res, 'User not found', 404);
      const active = hasActiveAccess(user);
      return sendSuccess(res, 'Access status', {
        active,
        expiresAt: user.accessExpiresAt,
        fee: ACCESS_FEE,
        days: ACCESS_DAYS,
      });
    } catch (error) {
      return sendError(res, 'Failed to fetch access status', 500);
    }
  }

  // Start a subscription payment. Creates a PENDING Payment row.
  // bookingRef is a generated subscription reference.
  async initiate(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const method = (req.body.method || 'KHALTI').toUpperCase();
      if (!['KHALTI', 'ESEWA'].includes(method)) {
        return sendError(res, 'method must be KHALTI or ESEWA', 400);
      }

      const bookingRef = `SUB-${Date.now()}`;
      const payment = this.paymentRepo.create({
        userId,
        bookingRef,
        bookingType: 'SUBSCRIPTION',
        amount: ACCESS_FEE,
        method,
        status: 'PENDING',
      });
      await this.paymentRepo.save(payment);

      Logger.info(`Subscription payment initiated: ${bookingRef} by ${userId}`);
      // NOTE: real Khalti/eSewa gateway URL would go here once keys are set.
      // For now we return the ref so the client can call the dev-complete route.
      return sendSuccess(res, 'Subscription payment initiated', {
        bookingRef,
        amount: `NPR ${ACCESS_FEE}`,
        method,
        // present only in non-prod so the frontend can simulate success:
        devComplete: process.env.NODE_ENV !== 'production',
      });
    } catch (error: any) {
      Logger.error('Subscription initiate error', error);
      return sendError(res, error.message || 'Failed to initiate subscription', 500);
    }
  }

  // DEV ONLY: simulate a successful gateway callback so we can test access
  // granting without a live Khalti/eSewa redirect. Disabled in production.
  async devComplete(req: Request, res: Response) {
    try {
      if (process.env.NODE_ENV === 'production') {
        return sendError(res, 'Not available in production', 403);
      }
      const { bookingRef } = req.body;
      const userId = req.user!.id;
      if (!bookingRef) return sendError(res, 'bookingRef required', 400);

      const payment = await this.paymentRepo.findOne({ where: { bookingRef } });
      if (!payment) return sendError(res, 'Payment not found', 404);
      if (payment.userId !== userId) return sendError(res, 'Unauthorized', 403);
      if (payment.bookingType !== 'SUBSCRIPTION') {
        return sendError(res, 'Not a subscription payment', 400);
      }
      if (payment.status === 'COMPLETED') {
        return sendError(res, 'Already completed', 400);
      }

      payment.status = 'COMPLETED';
      await this.paymentRepo.save(payment);

      // Grant access: EXTEND from current expiry if still active, else from now.
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) return sendError(res, 'User not found', 404);
      const base =
        hasActiveAccess(user) && user.accessExpiresAt
          ? new Date(user.accessExpiresAt)
          : new Date();
      base.setDate(base.getDate() + ACCESS_DAYS);
      user.accessExpiresAt = base;
      await this.userRepo.save(user);

      Logger.info(`Subscription granted: ${userId} until ${base.toISOString()}`);
      return sendSuccess(res, 'Access granted', {
        active: true,
        expiresAt: user.accessExpiresAt,
      });
    } catch (error: any) {
      Logger.error('Subscription devComplete error', error);
      return sendError(res, error.message || 'Failed to complete subscription', 500);
    }
  }
}