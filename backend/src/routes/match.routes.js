import { Router } from 'express';
import {
  buscarMatches,
  proponerMatch,
  getMyMatches,
  updateMatchStatus,
  getMensajes,
  confirmarIntercambio,
} from '../controllers/matchController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();
router.use(protect);

router.get('/buscar',              buscarMatches);
router.post('/proponer',           proponerMatch);
router.get('/',                    getMyMatches);
router.get('/:id/mensajes',        getMensajes);
router.put('/:id/status',          updateMatchStatus);
router.post('/:id/confirmar',      confirmarIntercambio);

export default router;
