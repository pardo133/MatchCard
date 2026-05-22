import { User } from '../models/user.model.js';
import { Cromo } from '../models/cromo.model.js';

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .populate('inventario.repetidos', 'numero nombre expansion imagenUrl rareza')
      .populate('inventario.faltas', 'numero nombre expansion imagenUrl rareza');
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateInventario(req, res, next) {
  try {
    const { repetidos, faltas } = req.body;

    // Validar que los IDs existen en la colección de cromos
    if (repetidos) {
      const count = await Cromo.countDocuments({ _id: { $in: repetidos } });
      if (count !== repetidos.length) {
        return res.status(400).json({ message: 'Algún cromo de repetidos no existe' });
      }
    }
    if (faltas) {
      const count = await Cromo.countDocuments({ _id: { $in: faltas } });
      if (count !== faltas.length) {
        return res.status(400).json({ message: 'Algún cromo de faltas no existe' });
      }
    }

    const updateData = {};
    if (repetidos) updateData['inventario.repetidos'] = repetidos;
    if (faltas)    updateData['inventario.faltas']    = faltas;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    )
      .populate('inventario.repetidos', 'numero nombre expansion imagenUrl rareza')
      .populate('inventario.faltas', 'numero nombre expansion imagenUrl rareza');

    res.json({ user });
  } catch (error) {
    next(error);
  }
}
