import { Router } from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth';
import * as controller from '../controllers/authController';

const router = Router();

router.post('/register',
  [body('email').isEmail(), body('password').isLength({ min: 8 }), body('firstName').notEmpty(), body('lastName').notEmpty()],
  controller.register
);
router.post('/login', [body('email').isEmail(), body('password').notEmpty()], controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', authenticate, controller.logout);
router.post('/verify-address', authenticate, controller.verifyAddress);
router.post('/verify-otp', authenticate, controller.verifyOtp);
router.post('/resend-otp', authenticate, controller.resendOtp);

export default router;
