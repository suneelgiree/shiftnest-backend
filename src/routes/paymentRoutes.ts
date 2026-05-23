import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const ctrl = new PaymentController();

router.post('/initiate', requireAuth, (req, res) => ctrl.initiate(req, res));
router.post('/verify',   requireAuth, (req, res) => ctrl.verify(req, res));
router.get('/my',        requireAuth, (req, res) => ctrl.getMyPayments(req, res));

export default router;

