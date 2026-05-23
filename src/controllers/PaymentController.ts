import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Payment } from '../models/Payment';
import { RoomBooking } from '../models/RoomBooking';
import { ShiftBooking } from '../models/ShiftBooking';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';

export class PaymentController {
  private paymentRepo = AppDataSource.getRepository(Payment);
  private roomBookingRepo = AppDataSource.getRepository(RoomBooking);
  private shiftBookingRepo = AppDataSource.getRepository(ShiftBooking);

  async initiate(req: Request, res: Response) {
    try {
      const { bookingRef, bookingType, method } = req.body;
      const userId = req.user!.id;

      if (!bookingRef || !bookingType || !method) {
        return sendError(res, 'bookingRef, bookingType, method are required', 400);
      }
      if (!['KHALTI', 'ESEWA'].includes(method.toUpperCase())) {
        return sendError(res, 'method must be KHALTI or ESEWA', 400);
      }

      let amount = 0;
      if (bookingType === 'ROOM_BOOKING') {
        const booking = await this.roomBookingRepo.findOne({ where: { bookingId: bookingRef } });
        if (!booking) return sendError(res, 'Room booking not found', 404);
        if (booking.userId !== userId) return sendError(res, 'Unauthorized', 403);
        amount = Number(booking.bookingFee);
      } else if (bookingType === 'SHIFT_BOOKING') {
        const booking = await this.shiftBookingRepo.findOne({ where: { bookingId: bookingRef } });
        if (!booking) return sendError(res, 'Shift booking not found', 404);
        if (booking.userId !== userId) return sendError(res, 'Unauthorized', 403);
        amount = Number(booking.totalFare);
      } else {
        return sendError(res, 'Invalid bookingType', 400);
      }

      const existing = await this.paymentRepo.findOne({
        where: { bookingRef, status: 'COMPLETED' },
      });
      if (existing) return sendError(res, 'Payment already completed for this booking', 400);

      const m = method.toUpperCase();
      let paymentUrl = '';
      let gatewayRef = '';

      if (m === 'KHALTI') {
        const result = await this.initiateKhalti(bookingRef, amount);
        paymentUrl = result.payment_url;
        gatewayRef = result.pidx;
      } else {
        const result = this.initiateEsewa(bookingRef, amount);
        paymentUrl = result.payment_url;
        gatewayRef = result.ref;
      }

      const payment = this.paymentRepo.create({
        userId, bookingRef, bookingType, amount, method: m,
        status: 'PENDING', gatewayRef,
      });
      await this.paymentRepo.save(payment);

      Logger.info(`Payment initiated: ${bookingRef} via ${m}`);
      return sendSuccess(res, 'Payment initiated', {
        paymentUrl, gatewayRef, amount: `NPR ${amount}`,
      });
    } catch (error: any) {
      Logger.error('Payment initiate error', error);
      return sendError(res, error.message || 'Failed to initiate payment', 500);
    }
  }

  async verify(req: Request, res: Response) {
    try {
      const { gatewayRef, method } = req.body;
      if (!gatewayRef || !method) return sendError(res, 'gatewayRef and method required', 400);

      const payment = await this.paymentRepo.findOne({ where: { gatewayRef } });
      if (!payment) return sendError(res, 'Payment record not found', 404);
      if (payment.status === 'COMPLETED') {
        return sendSuccess(res, 'Payment already verified', { status: 'COMPLETED' });
      }

      let verified = false;
      let gatewayResponse: object = {};
      const m = method.toUpperCase();

      if (m === 'KHALTI') {
        const result = await this.verifyKhalti(gatewayRef);
        verified = result.status === 'Completed';
        gatewayResponse = result;
      } else if (m === 'ESEWA') {
        const result = await this.verifyEsewa(req.body);
        verified = result.verified;
        gatewayResponse = result;
      }

      if (!verified) {
        payment.status = 'FAILED';
        payment.gatewayResponse = gatewayResponse;
        await this.paymentRepo.save(payment);
        return sendError(res, 'Payment verification failed', 400);
      }

      payment.status = 'COMPLETED';
      payment.gatewayResponse = gatewayResponse;
      await this.paymentRepo.save(payment);

      if (payment.bookingType === 'ROOM_BOOKING') {
        await this.roomBookingRepo.update(
          { bookingId: payment.bookingRef },
          { status: 'CONFIRMED', confirmedAt: new Date() }
        );
      } else if (payment.bookingType === 'SHIFT_BOOKING') {
        await this.shiftBookingRepo.update(
          { bookingId: payment.bookingRef },
          { status: 'CONFIRMED' }
        );
      }

      Logger.info(`Payment verified: ${payment.bookingRef}`);
      return sendSuccess(res, 'Payment verified successfully', {
        bookingRef: payment.bookingRef,
        amount: `NPR ${payment.amount}`,
        status: 'COMPLETED',
      });
    } catch (error: any) {
      Logger.error('Payment verify error', error);
      return sendError(res, error.message || 'Failed to verify payment', 500);
    }
  }

  async getMyPayments(req: Request, res: Response) {
    try {
      const payments = await this.paymentRepo.find({
        where: { userId: req.user!.id },
        order: { createdAt: 'DESC' },
      });
      return sendSuccess(res, 'Payments fetched', payments.map((p) => ({
        id: p.id,
        bookingRef: p.bookingRef,
        bookingType: p.bookingType,
        amount: `NPR ${Number(p.amount).toLocaleString('en-US')}`,
        method: p.method,
        status: p.status,
        createdAt: p.createdAt,
      })));
    } catch (error) {
      return sendError(res, 'Failed to fetch payments', 500);
    }
  }

  private async initiateKhalti(bookingRef: string, amount: number) {
    const body = {
      return_url: `${process.env.APP_URL}/api/payments/verify`,
      website_url: process.env.APP_URL,
      amount: amount * 100,
      purchase_order_id: bookingRef,
      purchase_order_name: `ShiftNest - ${bookingRef}`,
    };
    const response = await fetch('https://a.khalti.com/api/v2/epayment/initiate/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error('Khalti initiation failed');
    return response.json() as any;
  }

  private async verifyKhalti(pidx: string) {
    const response = await fetch('https://a.khalti.com/api/v2/epayment/lookup/', {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pidx }),
    });
    if (!response.ok) throw new Error('Khalti verification failed');
    return response.json() as any;
  }

  private initiateEsewa(bookingRef: string, amount: number) {
    const ref = `SN-${bookingRef}-${Date.now()}`;
    return {
      payment_url: process.env.NODE_ENV === 'production'
        ? 'https://esewa.com.np/epay/main'
        : 'https://uat.esewa.com.np/epay/main',
      ref,
      params: {
        amt: amount, tAmt: amount, pid: ref,
        scd: process.env.ESEWA_MERCHANT_CODE,
        su: `${process.env.APP_URL}/api/payments/verify`,
        fu: `${process.env.APP_URL}/api/payments/verify?status=failed`,
      },
    };
  }

  private async verifyEsewa(body: any): Promise<{ verified: boolean }> {
    const { oid, amt, refId } = body;
    const esewaUrl = process.env.NODE_ENV === 'production'
      ? 'https://esewa.com.np/epay/transrec'
      : 'https://uat.esewa.com.np/epay/transrec';
    const params = new URLSearchParams({
      amt, rid: refId, pid: oid, scd: process.env.ESEWA_MERCHANT_CODE!,
    });
    const response = await fetch(`${esewaUrl}?${params}`);
    const text = await response.text();
    return { verified: text.includes('<response>Success</response>') };
  }
}
