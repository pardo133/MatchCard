import { Router } from 'express';
import {
  getMatchesForUser,
  getMyMatches,
  updateMatchStatus,
} from '../controllers/matchController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/find', getMatchesForUser);
router.get('/',     getMyMatches);
router.put('/:id/status', updateMatchStatus);

export default router;
