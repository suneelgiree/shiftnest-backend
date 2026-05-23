"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const ctrl = new AuthController_1.AuthController();
router.post('/register', (req, res) => ctrl.register(req, res));
router.post('/login', (req, res) => ctrl.login(req, res));
router.post('/refresh-token', (req, res) => ctrl.refreshToken(req, res));
router.get('/me', auth_1.requireAuth, (req, res) => ctrl.getMe(req, res));
router.put('/me', auth_1.requireAuth, (req, res) => ctrl.updateMe(req, res));
router.put('/change-password', auth_1.requireAuth, (req, res) => ctrl.changePassword(req, res));
exports.default = router;
//# sourceMappingURL=authRoutes.js.map