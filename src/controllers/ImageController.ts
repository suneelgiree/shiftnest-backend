import { Request, Response } from 'express';
import { AppDataSource } from '../database/data-source';
import { Room } from '../models/Room';
import { RoomImage } from '../models/RoomImage';
import { sendSuccess, sendError } from '../utils/response';
import { Logger } from '../utils/logger';
import cloudinary from '../config/cloudinary';

export class ImageController {
  private roomRepo = AppDataSource.getRepository(Room);
  private roomImageRepo = AppDataSource.getRepository(RoomImage);

  // POST /api/rooms/:id/images
  async uploadRoomImages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const ownerId = req.user!.id;

      const room = await this.roomRepo.findOne({ where: { id } });
      if (!room) return sendError(res, 'Room not found', 404);
      if (room.ownerId !== ownerId && req.user!.role !== 'admin') {
        return sendError(res, 'Unauthorized', 403);
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return sendError(res, 'No images uploaded', 400);
      }

      // Get current image count for order index
      const existingCount = await this.roomImageRepo.count({ where: { roomId: id } });

      const uploaded: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Upload to Cloudinary as a stream from buffer
        const url = await new Promise<string>((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: `shiftnest/rooms/${id}`,
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
          stream.end(file.buffer);
        });

        const isFirst = existingCount === 0 && i === 0;

        const image = this.roomImageRepo.create({
          roomId: id,
          imageUrl: url,
          orderIndex: existingCount + i,
          isPrimary: isFirst,
        });
        await this.roomImageRepo.save(image);
        uploaded.push(url);
      }

      Logger.info(`Uploaded ${uploaded.length} images for room ${id}`);
      return sendSuccess(res, `${uploaded.length} image(s) uploaded successfully`, {
        roomId: id,
        images: uploaded,
      }, 201);
    } catch (error: any) {
      Logger.error('Image upload error', error);
      return sendError(res, error.message || 'Failed to upload images', 500);
    }
  }

  // DELETE /api/rooms/:id/images/:imageId
  async deleteRoomImage(req: Request, res: Response) {
    try {
      const { id, imageId } = req.params;
      const ownerId = req.user!.id;

      const room = await this.roomRepo.findOne({ where: { id } });
      if (!room) return sendError(res, 'Room not found', 404);
      if (room.ownerId !== ownerId && req.user!.role !== 'admin') {
        return sendError(res, 'Unauthorized', 403);
      }

      const image = await this.roomImageRepo.findOne({ where: { id: imageId, roomId: id } });
      if (!image) return sendError(res, 'Image not found', 404);

      // Extract public_id from Cloudinary URL and delete
      const urlParts = image.imageUrl.split('/');
      const publicId = urlParts
        .slice(urlParts.indexOf('shiftnest'))
        .join('/')
        .replace(/\.[^/.]+$/, '');

      await cloudinary.uploader.destroy(publicId);
      await this.roomImageRepo.remove(image);

      Logger.info(`Deleted image ${imageId} from room ${id}`);
      return sendSuccess(res, 'Image deleted successfully');
    } catch (error: any) {
      Logger.error('Image delete error', error);
      return sendError(res, error.message || 'Failed to delete image', 500);
    }
  }

  // PUT /api/rooms/:id/images/:imageId/primary
  async setPrimaryImage(req: Request, res: Response) {
    try {
      const { id, imageId } = req.params;
      const ownerId = req.user!.id;

      const room = await this.roomRepo.findOne({ where: { id } });
      if (!room) return sendError(res, 'Room not found', 404);
      if (room.ownerId !== ownerId && req.user!.role !== 'admin') {
        return sendError(res, 'Unauthorized', 403);
      }

      // Unset all primary flags for this room
      await this.roomImageRepo.update({ roomId: id }, { isPrimary: false });

      // Set new primary
      await this.roomImageRepo.update({ id: imageId, roomId: id }, { isPrimary: true });

      return sendSuccess(res, 'Primary image updated');
    } catch (error) {
      return sendError(res, 'Failed to update primary image', 500);
    }
  }
}