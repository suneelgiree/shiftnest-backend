import { Router } from 'express';
import { ShiftAssignmentController } from '../controllers/ShiftAssignmentController';

const router = Router();
const assignmentController = new ShiftAssignmentController();

router.post('/', (req, res) => assignmentController.assignShift(req, res));
router.get('/', (req, res) => assignmentController.getAllAssignments(req, res));
router.get('/:id', (req, res) => assignmentController.getAssignmentById(req, res));
router.put('/:id', (req, res) => assignmentController.updateAssignmentStatus(req, res));
router.delete('/:id', (req, res) => assignmentController.cancelAssignment(req, res));
router.get('/user/:userId', (req, res) => assignmentController.getAssignmentsByUser(req, res));

export default router;
