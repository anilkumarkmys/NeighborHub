import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/messagesController';

const router = Router();
router.use(authenticate);

router.get('/conversations', controller.listConversations);
router.post('/conversations', controller.createConversation);
router.get('/conversations/:id', controller.getConversation);
router.post('/conversations/:id/messages', controller.sendMessage);
router.put('/conversations/:id/read', controller.markRead);

export default router;
