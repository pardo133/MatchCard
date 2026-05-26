import { Router } from 'express';
import {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/register',              register);
router.post('/login',                 login);
router.get('/me',                     protect, getMe);
router.get('/verify-email/:token',    verifyEmail);
router.post('/resend-verification',   resendVerification); // pública, recibe email en body
router.post('/forgot-password',       forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;
