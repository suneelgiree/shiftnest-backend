"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ShiftAssignmentController_1 = require("../controllers/ShiftAssignmentController");
const router = (0, express_1.Router)();
const assignmentController = new ShiftAssignmentController_1.ShiftAssignmentController();
router.post('/', (req, res) => assignmentController.assignShift(req, res));
router.get('/', (req, res) => assignmentController.getAllAssignments(req, res));
router.get('/:id', (req, res) => assignmentController.getAssignmentById(req, res));
router.put('/:id', (req, res) => assignmentController.updateAssignmentStatus(req, res));
router.delete('/:id', (req, res) => assignmentController.cancelAssignment(req, res));
router.get('/user/:userId', (req, res) => assignmentController.getAssignmentsByUser(req, res));
exports.default = router;
//# sourceMappingURL=assignmentRoutes.js.map