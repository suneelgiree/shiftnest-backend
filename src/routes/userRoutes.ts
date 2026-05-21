import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// Auth routes
router.post('/register', (req, res) => userController.register(req, res));
router.post('/login', (req, res) => userController.login(req, res));

// User CRUD routes
router.get('/', (req, res) => userController.getAllUsers(req, res));
router.get('/:id', (req, res) => userController.getUserById(req, res));
router.put('/:id', (req, res) => userController.updateUser(req, res));
router.delete('/:id', (req, res) => userController.deleteUser(req, res));

export default router;
