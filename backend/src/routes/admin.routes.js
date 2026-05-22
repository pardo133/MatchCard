import { Router } from 'express';
import { getStats, getUsuarios, toggleAdmin, toggleActivo } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.middleware.js';

const router = Router();

// Middleware: solo admins
router.use(protect, (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Acceso solo para administradores' });
  next();
});

router.get('/stats',                   getStats);
router.get('/usuarios',                getUsuarios);
router.put('/usuarios/:id/admin',      toggleAdmin);
router.put('/usuarios/:id/activo',     toggleActivo);

export default router;
