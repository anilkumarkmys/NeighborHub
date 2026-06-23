import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/notificationsController';

const router = Router();
router.use(authenticate);

router.get('/', controller.listNotifications);
router.put('/:id/read', controller.markRead);
router.put('/read-all', controller.markAllRead);

export default router;
