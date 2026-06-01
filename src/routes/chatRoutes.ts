import { Router } from 'express';
import { ChatController } from '../controllers/ChatController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const ctrl = new ChatController();

router.post('/conversations',              requireAuth, (req, res) => ctrl.createConversation(req, res));
router.get('/conversations',               requireAuth, (req, res) => ctrl.getConversations(req, res));
router.get('/conversations/:id/messages',  requireAuth, (req, res) => ctrl.getMessages(req, res));
router.post('/conversations/:id/messages', requireAuth, (req, res) => ctrl.sendMessage(req, res));

export default router;