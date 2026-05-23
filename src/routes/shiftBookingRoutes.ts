import { Router } from 'express';
import { ShiftBookingController } from '../controllers/ShiftBookingController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const ctrl = new ShiftBookingController();

router.get('/vehicles',        (req, res) => ctrl.getVehicles(req, res));
router.post('/estimate',       requireAuth, (req, res) => ctrl.estimate(req, res));
router.post('/book',           requireAuth, (req, res) => ctrl.book(req, res));
router.get('/my',              requireAuth, (req, res) => ctrl.getMyShifts(req, res));
router.get('/:id',             requireAuth, (req, res) => ctrl.getShiftById(req, res));
router.get('/:id/track',       requireAuth, (req, res) => ctrl.trackShift(req, res));
router.put('/:id/cancel',      requireAuth, (req, res) => ctrl.cancelShift(req, res));

export default router;
