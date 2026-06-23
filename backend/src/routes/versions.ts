import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/versionsController';

const router = Router();

router.get('/check', controller.checkVersion);
router.get('/', authenticate, controller.listVersions);

export default router;
