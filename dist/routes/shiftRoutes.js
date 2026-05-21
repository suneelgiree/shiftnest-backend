"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ShiftController_1 = require("../controllers/ShiftController");
const router = (0, express_1.Router)();
const shiftController = new ShiftController_1.ShiftController();
router.post('/', (req, res) => shiftController.createShift(req, res));
router.get('/', (req, res) => shiftController.getAllShifts(req, res));
router.get('/:id', (req, res) => shiftController.getShiftById(req, res));
router.put('/:id', (req, res) => shiftController.updateShift(req, res));
router.delete('/:id', (req, res) => shiftController.deleteShift(req, res));
exports.default = router;
//# sourceMappingURL=shiftRoutes.js.map