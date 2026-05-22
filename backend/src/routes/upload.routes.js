import { Router } from 'express';
import { upload, uploadCardPhoto } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/card-photo', protect, upload.single('photo'), uploadCardPhoto);

export default router;
