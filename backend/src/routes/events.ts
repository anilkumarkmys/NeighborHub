import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/eventsController';

const router = Router();
router.use(authenticate);

router.get('/', controller.listEvents);
router.post('/', controller.createEvent);
router.get('/:id', controller.getEvent);
router.put('/:id', controller.updateEvent);
router.delete('/:id', controller.deleteEvent);
router.post('/:id/rsvp', controller.rsvpEvent);

export default router;
