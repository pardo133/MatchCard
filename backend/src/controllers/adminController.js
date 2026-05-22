import { User }  from '../models/user.model.js';
import { Cromo } from '../models/cromo.model.js';
import { Match } from '../models/match.model.js';

export async function getStats(req, res, next) {
  try {
    const [usuarios, cromos, matches, completados, ciudades] = await Promise.all([
      User.countDocuments(),
      Cromo.countDocuments(),
      Match.countDocuments(),
      Match.countDocuments({ status: 'completed' }),
      User.distinct('ciudad'),
    ]);
    res.json({ usuarios, cromos, matches, completados, ciudades: ciudades.length });
  } catch (error) { next(error); }
}

export async function getUsuarios(req, res, next) {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const query = search
      ? { $or: [{ username: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }] }
      : {};

    const [usuarios, total] = await Promise.all([
      User.find(query)
        .select('username email ciudad isAdmin isActive createdAt inventario')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    const data = usuarios.map(u => ({
      ...u,
      totalCartas: (u.inventario?.repetidos?.length || 0) + (u.inventario?.faltas?.length || 0),
    }));

    res.json({ usuarios: data, total, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
}

export async function toggleAdmin(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'No puedes cambiar tu propio rol' });

    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ user });
  } catch (error) { next(error); }
}

export async function toggleActivo(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ user });
  } catch (error) { next(error); }
}
