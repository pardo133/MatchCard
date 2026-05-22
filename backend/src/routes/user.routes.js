import { Router } from 'express';
import { getProfile, updateInventario } from '../controllers/userController.js';
import { protect } from '../middleware/auth.middleware.js';
import { User }   from '../models/user.model.js';

const router = Router();
router.use(protect);

router.get('/profile',    getProfile);
router.put('/inventario', updateInventario);

// Actualizar ubicación geográfica
router.put('/ubicacion', async (req, res, next) => {
  try {
    const { longitud, latitud, ciudad } = req.body;
    if (typeof longitud !== 'number' || typeof latitud !== 'number') {
      return res.status(400).json({ message: 'Coordenadas inválidas' });
    }
    const update = {
      ubicacion: { type: 'Point', coordinates: [longitud, latitud] },
    };
    if (ciudad) update.ciudad = ciudad;

    const user = await User.findByIdAndUpdate(req.user._id, update, { new: true });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
