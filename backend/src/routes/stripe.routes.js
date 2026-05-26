import { Router } from 'express';
import { createCheckout } from '../controllers/stripeController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Requiere autenticación: necesitamos el userId del usuario logueado
router.post('/checkout', protect, createCheckout);

export default router;
