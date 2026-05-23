import { Router } from 'express';
import { ReviewController } from '../controllers/ReviewController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const ctrl = new ReviewController();

router.get('/room/:roomId',      (req, res) => ctrl.getRoomReviews(req, res));
router.post('/room/:roomId',     requireAuth, (req, res) => ctrl.reviewRoom(req, res));
router.post('/driver/:driverId', requireAuth, (req, res) => ctrl.reviewDriver(req, res));

export default router;
