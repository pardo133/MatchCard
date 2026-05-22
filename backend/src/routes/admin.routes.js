import { Router } from 'express';
import { getStats } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);
router.get('/stats', getStats);

export default router;
