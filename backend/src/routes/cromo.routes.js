import { Router } from 'express';
import { getAllCromos, createCromo, deleteCromo } from '../controllers/cromoController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/',     getAllCromos);
router.post('/',    protect, createCromo);
router.delete('/:id', protect, deleteCromo);

export default router;
