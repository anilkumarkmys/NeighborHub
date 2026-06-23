import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/usersController';

const router = Router();
router.use(authenticate);

router.get('/me', controller.getMe);
router.put('/me', controller.updateMe);
router.put('/me/push-token', controller.updatePushToken);
router.get('/neighbors', controller.getNeighbors);
router.get('/:id', controller.getUser);

export default router;
