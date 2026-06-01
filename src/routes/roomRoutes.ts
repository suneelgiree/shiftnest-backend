import { Router } from 'express';
import { RoomController } from '../controllers/RoomController';
import { RoomBookingController } from '../controllers/RoomBookingController';
import { SavedRoomController } from '../controllers/SavedRoomController';
import { requireAuth, requireRole, optionalAuth } from '../middleware/auth';
import { ImageController } from '../controllers/ImageController';
import { upload } from '../middleware/upload';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();
const roomCtrl = new RoomController();
const bookingCtrl = new RoomBookingController();
const savedCtrl = new SavedRoomController();
const imageCtrl = new ImageController();

// --- Public ---
router.get('/popular-areas', (req, res) => roomCtrl.getPopularAreas(req, res));
router.get('/recommended',   (req, res) => roomCtrl.getRecommendedRooms(req, res));
router.get('/my', requireAuth, requireRole('owner', 'admin'), (req, res) => roomCtrl.getMyRooms(req, res));
router.get('/',              (req, res) => roomCtrl.getRooms(req, res));
router.get('/:id', optionalAuth, (req, res) => roomCtrl.getRoomById(req, res));

// --- Owner only ---
router.post('/',      requireAuth, requireRole('owner', 'admin'), (req, res) => roomCtrl.createRoom(req, res));
router.put('/:id',    requireAuth, requireRole('owner', 'admin'), (req, res) => roomCtrl.updateRoom(req, res));
router.delete('/:id', requireAuth, requireRole('owner', 'admin'), (req, res) => roomCtrl.deleteRoom(req, res));

// --- Bookings ---
router.post('/bookings',           requireAuth, (req, res) => bookingCtrl.bookRoom(req, res));
router.get('/bookings/my',         requireAuth, (req, res) => bookingCtrl.getMyBookings(req, res));
router.get('/bookings/owner', requireAuth, (req, res) => bookingCtrl.getOwnerBookings(req, res));
router.get('/bookings/:id',        requireAuth, (req, res) => bookingCtrl.getBookingById(req, res));
router.put('/bookings/:id/cancel', requireAuth, (req, res) => bookingCtrl.cancelBooking(req, res));

// --- Saved rooms ---
router.get('/saved',            requireAuth, (req, res) => savedCtrl.getSavedRooms(req, res));
router.post('/saved/:roomId',   requireAuth, (req, res) => savedCtrl.saveRoom(req, res));
router.delete('/saved/:roomId', requireAuth, (req, res) => savedCtrl.removeSavedRoom(req, res));
// --- Image upload ---
router.post('/:id/images', requireAuth, requireRole('owner', 'admin'), uploadLimiter, upload.array('images', 12), (req, res) => imageCtrl.uploadRoomImages(req, res));
router.delete('/:id/images/:imageId', requireAuth, requireRole('owner', 'admin'), (req, res) => imageCtrl.deleteRoomImage(req, res));
router.put('/:id/images/:imageId/primary', requireAuth, requireRole('owner', 'admin'), (req, res) => imageCtrl.setPrimaryImage(req, res));

export default router;
