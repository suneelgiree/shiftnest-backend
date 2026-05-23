"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RoomController_1 = require("../controllers/RoomController");
const RoomBookingController_1 = require("../controllers/RoomBookingController");
const SavedRoomController_1 = require("../controllers/SavedRoomController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const roomCtrl = new RoomController_1.RoomController();
const bookingCtrl = new RoomBookingController_1.RoomBookingController();
const savedCtrl = new SavedRoomController_1.SavedRoomController();
// --- Public ---
router.get('/popular-areas', (req, res) => roomCtrl.getPopularAreas(req, res));
router.get('/recommended', (req, res) => roomCtrl.getRecommendedRooms(req, res));
router.get('/', (req, res) => roomCtrl.getRooms(req, res));
router.get('/:id', (req, res) => roomCtrl.getRoomById(req, res));
// --- Owner only ---
router.post('/', auth_1.requireAuth, (0, auth_1.requireRole)('owner', 'admin'), (req, res) => roomCtrl.createRoom(req, res));
router.put('/:id', auth_1.requireAuth, (0, auth_1.requireRole)('owner', 'admin'), (req, res) => roomCtrl.updateRoom(req, res));
router.delete('/:id', auth_1.requireAuth, (0, auth_1.requireRole)('owner', 'admin'), (req, res) => roomCtrl.deleteRoom(req, res));
// --- Bookings ---
router.post('/bookings', auth_1.requireAuth, (req, res) => bookingCtrl.bookRoom(req, res));
router.get('/bookings/my', auth_1.requireAuth, (req, res) => bookingCtrl.getMyBookings(req, res));
router.get('/bookings/:id', auth_1.requireAuth, (req, res) => bookingCtrl.getBookingById(req, res));
router.put('/bookings/:id/cancel', auth_1.requireAuth, (req, res) => bookingCtrl.cancelBooking(req, res));
// --- Saved rooms ---
router.get('/saved', auth_1.requireAuth, (req, res) => savedCtrl.getSavedRooms(req, res));
router.post('/saved/:roomId', auth_1.requireAuth, (req, res) => savedCtrl.saveRoom(req, res));
router.delete('/saved/:roomId', auth_1.requireAuth, (req, res) => savedCtrl.removeSavedRoom(req, res));
exports.default = router;
//# sourceMappingURL=roomRoutes.js.map