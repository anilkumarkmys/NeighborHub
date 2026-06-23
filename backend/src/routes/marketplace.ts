import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/marketplaceController';

const router = Router();
router.use(authenticate);

router.get('/', controller.listListings);
router.post('/', controller.createListing);
router.get('/:id', controller.getListing);
router.put('/:id', controller.updateListing);
router.delete('/:id', controller.deleteListing);
router.post('/:id/contact', controller.contactSeller);

export default router;
