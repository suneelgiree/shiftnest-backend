import { Router } from 'express';
import { AdminController } from '../controllers/AdminController';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const ctrl = new AdminController();

// All admin routes require auth + admin role
router.use(requireAuth, requireRole('admin'));

// Dashboard
router.get('/dashboard', (req, res) => ctrl.getDashboard(req, res));

// Users
router.get('/users',              (req, res) => ctrl.getAllUsers(req, res));
router.put('/users/:id/role',     (req, res) => ctrl.updateUserRole(req, res));
router.delete('/users/:id',       (req, res) => ctrl.deleteUser(req, res));

// Rooms
router.get('/rooms',              (req, res) => ctrl.getAllRooms(req, res));
router.put('/rooms/:id/verify',   (req, res) => ctrl.verifyRoom(req, res));
router.put('/rooms/:id/toggle',   (req, res) => ctrl.toggleRoom(req, res));

// Room bookings
router.get('/bookings',                  (req, res) => ctrl.getAllBookings(req, res));
router.put('/bookings/:id/status',       (req, res) => ctrl.updateBookingStatus(req, res));

// Shift bookings
router.get('/shifts',                    (req, res) => ctrl.getAllShiftBookings(req, res));
router.put('/shifts/:id/assign',         (req, res) => ctrl.assignDriver(req, res));

// Drivers
router.get('/drivers',                   (req, res) => ctrl.getAllDrivers(req, res));
router.post('/drivers',                  (req, res) => ctrl.createDriver(req, res));

export default router;
