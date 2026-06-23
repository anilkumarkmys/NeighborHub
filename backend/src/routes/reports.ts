import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/reportsController';

const router = Router();
router.use(authenticate);

router.post('/', controller.createReport);

export default router;
