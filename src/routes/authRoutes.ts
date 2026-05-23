import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const ctrl = new AuthController();

router.post('/register',         (req, res) => ctrl.register(req, res));
router.post('/login',            (req, res) => ctrl.login(req, res));
router.post('/refresh-token',    (req, res) => ctrl.refreshToken(req, res));
router.get('/me',   requireAuth, (req, res) => ctrl.getMe(req, res));
router.put('/me',   requireAuth, (req, res) => ctrl.updateMe(req, res));
router.put('/change-password', requireAuth, (req, res) => ctrl.changePassword(req, res));

export default router;
