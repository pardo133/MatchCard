import { Router } from 'express';
import { getProfile, updateInventario } from '../controllers/userController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/profile',    getProfile);
router.put('/inventario', updateInventario);

export default router;
