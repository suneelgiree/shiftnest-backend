"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ShiftBookingController_1 = require("../controllers/ShiftBookingController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const ctrl = new ShiftBookingController_1.ShiftBookingController();
router.get('/vehicles', (req, res) => ctrl.getVehicles(req, res));
router.post('/estimate', auth_1.requireAuth, (req, res) => ctrl.estimate(req, res));
router.post('/book', auth_1.requireAuth, (req, res) => ctrl.book(req, res));
router.get('/my', auth_1.requireAuth, (req, res) => ctrl.getMyShifts(req, res));
router.get('/:id', auth_1.requireAuth, (req, res) => ctrl.getShiftById(req, res));
router.get('/:id/track', auth_1.requireAuth, (req, res) => ctrl.trackShift(req, res));
router.put('/:id/cancel', auth_1.requireAuth, (req, res) => ctrl.cancelShift(req, res));
exports.default = router;
//# sourceMappingURL=shiftBookingRoutes.js.map