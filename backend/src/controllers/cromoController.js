import { Cromo } from '../models/cromo.model.js';
import { User }  from '../models/user.model.js';

export async function getAllCromos(req, res, next) {
  try {
    const cromos = await Cromo.find().sort({ expansion: 1, numero: 1 });
    res.json({ cromos });
  } catch (error) { next(error); }
}

// Crea la carta si no existe (catálogo compartido) y la añade al inventario del usuario
export async function createCromo(req, res, next) {
  try {
    const { numero, nombre, coleccion, rareza, imagenUrl, addTo } = req.body;

    if (!numero || !nombre || !coleccion) {
      return res.status(400).json({ message: 'Número, nombre y colección son obligatorios' });
    }

    // Buscar carta existente (catálogo compartido: misma carta para todos los usuarios)
    let cromo = await Cromo.findOne({
      numero:    Number(numero),
      expansion: coleccion.trim(),
    });

    if (!cromo) {
      cromo = await Cromo.create({
        numero:    Number(numero),
        nombre:    nombre.trim(),
        expansion: coleccion.trim(),
        rareza:    rareza || 'common',
        imagenUrl: imagenUrl || '',
      });
    }

    // Añadir al inventario del usuario
    if (addTo === 'repetidos' || addTo === 'faltas') {
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { [`inventario.${addTo}`]: cromo._id } }
      );
    }

    res.status(201).json({ cromo });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Esa carta ya existe en el catálogo' });
    }
    next(error);
  }
}

export async function deleteCromo(req, res, next) {
  try {
    await Cromo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Carta eliminada' });
  } catch (error) { next(error); }
}
