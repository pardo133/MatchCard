import { Router } from 'express';
import { getProfile, updateInventario, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.get('/profile',    getProfile);
router.put('/profile',    updateProfile);
router.put('/inventario', updateInventario);

export default router;
