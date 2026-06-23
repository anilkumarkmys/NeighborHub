import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/neighborhoodsController';

const router = Router();
router.use(authenticate);

router.get('/', controller.listNeighborhoods);
router.get('/mine', controller.myNeighborhood);

export default router;
