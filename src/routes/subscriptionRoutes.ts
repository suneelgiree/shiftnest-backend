import { Router } from 'express';
import { SubscriptionController } from '../controllers/SubscriptionController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const ctrl = new SubscriptionController();

router.get('/status',        requireAuth, (req, res) => ctrl.status(req, res));
router.post('/initiate',     requireAuth, (req, res) => ctrl.initiate(req, res));
router.post('/dev-complete', requireAuth, (req, res) => ctrl.devComplete(req, res));

export default router;