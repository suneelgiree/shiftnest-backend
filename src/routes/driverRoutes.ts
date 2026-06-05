import { Router } from 'express';
import { DriverApplicationController } from '../controllers/DriverApplicationController';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const ctrl = new DriverApplicationController();

// Submit application (multipart: idCard + numberplate photos + vehicleType + plateNumber)
router.post(
  '/apply',
  requireAuth,
  upload.fields([
    { name: 'idCard', maxCount: 1 },
    { name: 'numberplate', maxCount: 1 },
  ]),
  (req, res) => ctrl.apply(req, res)
);

// Check my application status
router.get('/application', requireAuth, (req, res) => ctrl.myApplication(req, res));

export default router;