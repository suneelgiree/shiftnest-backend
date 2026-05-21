import { Router } from 'express';
import { ShiftController } from '../controllers/ShiftController';

const router = Router();
const shiftController = new ShiftController();

router.post('/', (req, res) => shiftController.createShift(req, res));
router.get('/', (req, res) => shiftController.getAllShifts(req, res));
router.get('/:id', (req, res) => shiftController.getShiftById(req, res));
router.put('/:id', (req, res) => shiftController.updateShift(req, res));
router.delete('/:id', (req, res) => shiftController.deleteShift(req, res));

export default router;
