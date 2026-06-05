import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { DriverApplication } from '../models/DriverApplication';
import { Vehicle } from '../models/Vehicle';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';
import cloudinary from '../config/cloudinary';

export class DriverApplicationController {
  private appRepo = AppDataSource.getRepository(DriverApplication);
  private vehicleRepo = AppDataSource.getRepository(Vehicle);

  private uploadBuffer(buffer: Buffer, folder: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: [
            { width: 1280, crop: 'limit' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve(result.secure_url);
        }
      );
      stream.end(buffer);
    });
  }

  // POST /api/driver/apply  (multipart: idCard + numberplate files, vehicleType, plateNumber)
  async apply(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const { vehicleType, plateNumber } = req.body;

      if (!vehicleType || !plateNumber) {
        return sendError(res, 'vehicleType and plateNumber are required', 400);
      }

      // validate vehicle type exists
      const vehicle = await this.vehicleRepo.findOne({
        where: { vehicleType: String(vehicleType).toUpperCase() },
      });
      if (!vehicle) return sendError(res, 'Invalid vehicle type', 400);

      // files come as fields idCard + numberplate via upload.fields
      const files = req.files as { [field: string]: Express.Multer.File[] } | undefined;
      const idCardFile = files?.['idCard']?.[0];
      const plateFile = files?.['numberplate']?.[0];
      if (!idCardFile || !plateFile) {
        return sendError(res, 'Both idCard and numberplate photos are required', 400);
      }

      // block duplicate pending application
      const existingPending = await this.appRepo.findOne({
        where: { userId, status: 'PENDING' },
      });
      if (existingPending) {
        return sendError(res, 'You already have a pending application', 409);
      }

      // upload both photos
      const idCardPhotoUrl = await this.uploadBuffer(idCardFile.buffer, `shiftnest/drivers/${userId}`);
      const numberplatePhotoUrl = await this.uploadBuffer(plateFile.buffer, `shiftnest/drivers/${userId}`);

      const application = this.appRepo.create({
        userId,
        vehicleType: String(vehicleType).toUpperCase(),
        plateNumber,
        idCardPhotoUrl,
        numberplatePhotoUrl,
        status: 'PENDING',
      });
      await this.appRepo.save(application);

      Logger.info(`Driver application submitted: ${userId}`);
      return sendSuccess(res, 'Application submitted for review', {
        id: application.id,
        status: application.status,
        vehicleType: application.vehicleType,
        plateNumber: application.plateNumber,
      }, 201);
    } catch (error: any) {
      Logger.error('Driver apply error', error);
      return sendError(res, error.message || 'Failed to submit application', 500);
    }
  }

  // GET /api/driver/application  -> the user's latest application (or null)
  async myApplication(req: Request, res: Response) {
    try {
      const userId = req.user!.id;
      const app = await this.appRepo.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
      if (!app) return sendSuccess(res, 'No application', { application: null });
      return sendSuccess(res, 'Application fetched', {
        application: {
          id: app.id,
          status: app.status,
          vehicleType: app.vehicleType,
          plateNumber: app.plateNumber,
          reviewNote: app.reviewNote,
          createdAt: app.createdAt,
        },
      });
    } catch (error) {
      Logger.error('My application error', error);
      return sendError(res, 'Failed to fetch application', 500);
    }
  }
}