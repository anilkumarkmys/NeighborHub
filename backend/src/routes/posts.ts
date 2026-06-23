import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/postsController';

const router = Router();
router.use(authenticate);

router.get('/', controller.listPosts);
router.post('/', controller.createPost);
router.get('/:id', controller.getPost);
router.put('/:id', controller.updatePost);
router.delete('/:id', controller.deletePost);
router.post('/:id/thank', controller.thankPost);
router.get('/:id/replies', controller.getReplies);
router.post('/:id/replies', controller.addReply);
router.post('/:id/report', controller.reportPost);

export default router;
