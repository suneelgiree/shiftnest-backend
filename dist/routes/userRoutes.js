"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
// Auth routes
router.post('/register', (req, res) => userController.register(req, res));
router.post('/login', (req, res) => userController.login(req, res));
// User CRUD routes
router.get('/', (req, res) => userController.getAllUsers(req, res));
router.get('/:id', (req, res) => userController.getUserById(req, res));
router.put('/:id', (req, res) => userController.updateUser(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));
exports.default = router;
//# sourceMappingURL=userRoutes.js.map