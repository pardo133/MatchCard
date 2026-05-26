import { Router } from 'express';
import { getAllCromos, createCromo, deleteCromo, buscarMatch, buscarPublico } from '../controllers/cromoController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/buscar-publico', buscarPublico);          // sin auth — hero de Home
router.get('/buscar-match',   protect, buscarMatch);   // con auth — Buscador
router.get('/',               getAllCromos);
router.post('/',              protect, createCromo);
router.delete('/:id',         protect, deleteCromo);

export default router;
