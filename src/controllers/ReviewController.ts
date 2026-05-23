import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Review } from '../models/Review';
import { Driver } from '../models/Driver';
import { RoomBooking } from '../models/RoomBooking';
import { ShiftBooking } from '../models/ShiftBooking';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

export class ReviewController {
  private reviewRepo = AppDataSource.getRepository(Review);
  private driverRepo = AppDataSource.getRepository(Driver);
  private roomBookingRepo = AppDataSource.getRepository(RoomBooking);
  private shiftBookingRepo = AppDataSource.getRepository(ShiftBooking);

  async reviewRoom(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const { rating, comment, bookingRef } = req.body;
      const reviewerId = req.user!.id;

      if (!rating || rating < 1 || rating > 5) return sendError(res, 'Rating must be 1-5', 400);
      if (!bookingRef) return sendError(res, 'bookingRef is required', 400);

      const booking = await this.roomBookingRepo.findOne({
        where: { bookingId: bookingRef, userId: reviewerId, status: 'COMPLETED' },
      });
      if (!booking) return sendError(res, 'No completed booking found', 403);

      const existing = await this.reviewRepo.findOne({ where: { bookingRef } });
      if (existing) return sendError(res, 'Already reviewed this booking', 409);

      const review = this.reviewRepo.create({
        reviewerId, targetType: 'ROOM', targetId: roomId,
        rating: Number(rating), comment, bookingRef,
      });
      await this.reviewRepo.save(review);

      Logger.info(`Room reviewed: ${roomId} by ${reviewerId}`);
      return sendSuccess(res, 'Review submitted', { id: review.id, rating: review.rating }, 201);
    } catch (error) {
      Logger.error('Review room error', error);
      return sendError(res, 'Failed to submit review', 500);
    }
  }

  async reviewDriver(req: Request, res: Response) {
    try {
      const { driverId } = req.params;
      const { rating, comment, bookingRef } = req.body;
      const reviewerId = req.user!.id;

      if (!rating || rating < 1 || rating > 5) return sendError(res, 'Rating must be 1-5', 400);
      if (!bookingRef) return sendError(res, 'bookingRef is required', 400);

      const booking = await this.shiftBookingRepo.findOne({
        where: { bookingId: bookingRef, userId: reviewerId, status: 'COMPLETED' },
      });
      if (!booking) return sendError(res, 'No completed shift found', 403);

      const existing = await this.reviewRepo.findOne({ where: { bookingRef } });
      if (existing) return sendError(res, 'Already reviewed this booking', 409);

      const review = this.reviewRepo.create({
        reviewerId, targetType: 'DRIVER', targetId: driverId,
        rating: Number(rating), comment, bookingRef,
      });
      await this.reviewRepo.save(review);

      await this.updateDriverRating(driverId);

      return sendSuccess(res, 'Driver reviewed', { id: review.id, rating: review.rating }, 201);
    } catch (error) {
      return sendError(res, 'Failed to submit review', 500);
    }
  }

  async getRoomReviews(req: Request, res: Response) {
    try {
      const { roomId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const [reviews, total] = await this.reviewRepo
        .createQueryBuilder('r')
        .leftJoinAndSelect('r.reviewer', 'reviewer')
        .where('r.targetType = :type AND r.targetId = :id', { type: 'ROOM', id: roomId })
        .orderBy('r.createdAt', 'DESC')
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      const avg = total > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      return sendSuccess(res, 'Reviews fetched', {
        averageRating: parseFloat(avg.toFixed(1)),
        totalReviews: total,
        reviews: reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          reviewer: {
            name: `${r.reviewer.firstName} ${r.reviewer.lastName}`,
            avatarUrl: r.reviewer.avatarUrl,
          },
          createdAt: r.createdAt,
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    } catch (error) {
      return sendError(res, 'Failed to fetch reviews', 500);
    }
  }

  private async updateDriverRating(driverId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.targetType = :type AND r.targetId = :id', { type: 'DRIVER', id: driverId })
      .getRawOne();

    const avg = parseFloat(parseFloat(result?.avg || '5').toFixed(2));
    const count = parseInt(result?.count || '0');
    await this.driverRepo.update(driverId, { rating: avg, totalRatings: count });
  }
}
