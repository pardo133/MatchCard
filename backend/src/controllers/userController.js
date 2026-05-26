import { User }  from '../models/user.model.js';
import { Cromo } from '../models/cromo.model.js';

const POPULATE_REPES = 'numero nombre expansion imagenUrl rareza categoria';

export async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .populate('inventario.repetidos', POPULATE_REPES)
      .populate('inventario.faltas',    POPULATE_REPES);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const { ciudad, telefono } = req.body;
    const update = {};
    if (ciudad   !== undefined) update.ciudad   = ciudad.trim();
    if (telefono !== undefined) update.telefono = telefono.trim();

    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true })
      .populate('inventario.repetidos', POPULATE_REPES)
      .populate('inventario.faltas',    POPULATE_REPES);
    res.json({ user });
  } catch (error) {
    next(error);
  }
}

export async function updateInventario(req, res, next) {
  try {
    const { repetidos, faltas } = req.body;

    if (repetidos) {
      const count = await Cromo.countDocuments({ _id: { $in: repetidos } });
      if (count !== repetidos.length)
        return res.status(400).json({ message: 'Algún cromo de repetidos no existe' });
    }
    if (faltas) {
      const count = await Cromo.countDocuments({ _id: { $in: faltas } });
      if (count !== faltas.length)
        return res.status(400).json({ message: 'Algún cromo de faltas no existe' });
    }

    const updateData = {};
    if (repetidos) updateData['inventario.repetidos'] = repetidos;
    if (faltas)    updateData['inventario.faltas']    = faltas;

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updateData }, { new: true })
      .populate('inventario.repetidos', POPULATE_REPES)
      .populate('inventario.faltas',    POPULATE_REPES);

    res.json({ user });
  } catch (error) {
    next(error);
  }
}
