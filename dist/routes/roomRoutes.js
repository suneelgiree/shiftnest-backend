"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RoomController_1 = require("../controllers/RoomController");
const RoomBookingController_1 = require("../controllers/RoomBookingController");
const SavedRoomController_1 = require("../controllers/SavedRoomController");
const router = (0, express_1.Router)();
const roomController = new RoomController_1.RoomController();
const roomBookingController = new RoomBookingController_1.RoomBookingController();
const savedRoomController = new SavedRoomController_1.SavedRoomController();
// Room routes
router.get('/popular-areas', (req, res) => roomController.getPopularAreas(req, res));
router.get('/recommended', (req, res) => roomController.getRecommendedRooms(req, res));
router.get('/', (req, res) => roomController.getRooms(req, res));
router.get('/:id', (req, res) => roomController.getRoomById(req, res));
router.post('/', (req, res) => roomController.createRoom(req, res));
router.put('/:id', (req, res) => roomController.updateRoom(req, res));
router.delete('/:id', (req, res) => roomController.deleteRoom(req, res));
// Booking routes
router.post('/bookings', (req, res) => roomBookingController.bookRoom(req, res));
router.get('/bookings/my', (req, res) => roomBookingController.getMyBookings(req, res));
router.get('/bookings/:id', (req, res) => roomBookingController.getBookingById(req, res));
router.put('/bookings/:id/cancel', (req, res) => roomBookingController.cancelBooking(req, res));
// Saved rooms routes
router.get('/saved', (req, res) => savedRoomController.getSavedRooms(req, res));
router.post('/saved/:roomId', (req, res) => savedRoomController.saveRoom(req, res));
router.delete('/saved/:roomId', (req, res) => savedRoomController.removeSavedRoom(req, res));
exports.default = router;
//# sourceMappingURL=roomRoutes.js.map