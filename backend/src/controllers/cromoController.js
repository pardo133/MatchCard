import { Cromo } from '../models/cromo.model.js';
import { User }  from '../models/user.model.js';

const FREE_DAILY_LIMIT = 3;

export async function getAllCromos(req, res, next) {
  try {
    const cromos = await Cromo.find().sort({ expansion: 1, numero: 1 });
    res.json({ cromos });
  } catch (error) { next(error); }
}

// Crea la carta si no existe (catálogo compartido) y la añade al inventario del usuario
export async function createCromo(req, res, next) {
  try {
    const { numero, nombre, coleccion, rareza, imagenUrl, addTo, categoria } = req.body;

    if (!nombre || !coleccion) {
      return res.status(400).json({ message: 'Nombre y sección son obligatorios' });
    }

    const CATEGORIAS_VALIDAS = ['Pokémon', 'Deportes', 'Anime', 'Otros'];
    const categoriaFinal = CATEGORIAS_VALIDAS.includes(categoria) ? categoria : 'Otros';

    let cromo;
    if (numero) {
      cromo = await Cromo.findOne({ numero: Number(numero), expansion: coleccion.trim() });
    } else {
      cromo = await Cromo.findOne({ nombre: nombre.trim(), expansion: coleccion.trim() });
    }

    if (!cromo) {
      const numeroFinal = numero ? Number(numero) : Date.now() % 999999;
      cromo = await Cromo.create({
        numero:    numeroFinal,
        nombre:    nombre.trim(),
        expansion: coleccion.trim(),
        rareza:    rareza || 'common',
        imagenUrl: imagenUrl || '',
        categoria: categoriaFinal,
      });
    } else if (imagenUrl) {
      cromo = await Cromo.findByIdAndUpdate(
        cromo._id,
        { $set: { imagenUrl } },
        { new: true }
      );
    }

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

/* ─── Matchmaking con límite diario ─────────────────────── */
export async function buscarMatch(req, res, next) {
  try {
    const { nombre, categoria } = req.query;
    const userId = req.user._id;

    if (!nombre || nombre.trim().length < 2) {
      return res.status(400).json({ message: 'Escribe al menos 2 caracteres para buscar' });
    }

    // ── Comprobación y actualización del límite diario ──
    const todayStr = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
    const userLimits = await User.findById(userId)
      .select('isPremium searchesToday lastSearchDate')
      .lean();

    let limitReached  = false;
    let searchesLeft  = null;

    if (!userLimits.isPremium) {
      let count = userLimits.searchesToday || 0;

      if (userLimits.lastSearchDate !== todayStr) {
        // Nuevo día: reiniciar contador
        count = 0;
        await User.findByIdAndUpdate(userId, {
          searchesToday:  1,
          lastSearchDate: todayStr,
        });
        count = 1;
      } else if (count >= FREE_DAILY_LIMIT) {
        limitReached = true;
      } else {
        await User.findByIdAndUpdate(userId, { $inc: { searchesToday: 1 } });
        count += 1;
      }

      searchesLeft = limitReached ? 0 : Math.max(0, FREE_DAILY_LIMIT - count);
    }

    // ── Búsqueda en catálogo ──
    const CATEGORIAS_VALIDAS = ['Pokémon', 'Deportes', 'Anime', 'Otros'];
    const queryMongo = { nombre: { $regex: nombre.trim(), $options: 'i' } };
    if (categoria && CATEGORIAS_VALIDAS.includes(categoria)) {
      queryMongo.categoria = categoria;
    }

    const cromasEncontrados = await Cromo.find(queryMongo)
      .select('_id nombre expansion numero categoria rareza imagenUrl')
      .lean();

    if (cromasEncontrados.length === 0) {
      return res.json({ resultados: [], cromasEncontrados: [], limitReached, searchesLeft });
    }

    const idsEncontrados = cromasEncontrados.map(c => c._id);

    const yo = await User.findById(userId).select('inventario').lean();
    const misRepetidosIds = yo.inventario.repetidos.map(id => id.toString());

    const usuarios = await User.find({
      _id:      { $ne: userId },
      isActive: true,
      'inventario.repetidos': { $in: idsEncontrados },
    }).select('username ciudad email telefono inventario').lean();

    const resultados = usuarios.map(u => {
      const repUsuarioIds    = u.inventario.repetidos.map(id => id.toString());
      const faltasUsuarioIds = u.inventario.faltas.map(id => id.toString());

      const idsMeDa = repUsuarioIds.filter(id =>
        idsEncontrados.some(c => c.toString() === id)
      );
      if (idsMeDa.length === 0) return null;

      const idsYoDoy   = misRepetidosIds.filter(id => faltasUsuarioIds.includes(id));
      const cartasMeDa = cromasEncontrados.filter(c => idsMeDa.includes(c._id.toString()));

      return {
        usuario: {
          _id:      u._id,
          username: u.username,
          ciudad:   u.ciudad,
          // Contact info only for users within their daily limit
          email:    limitReached ? null : u.email,
          telefono: limitReached ? null : (u.telefono || ''),
        },
        cartasMeDa,
        cantidadYoDoy:   idsYoDoy.length,
        esBidireccional: idsYoDoy.length > 0,
      };
    }).filter(Boolean);

    resultados.sort((a, b) => {
      if (a.esBidireccional !== b.esBidireccional) return a.esBidireccional ? -1 : 1;
      return b.cartasMeDa.length - a.cartasMeDa.length;
    });

    res.json({ resultados, cromasEncontrados, limitReached, searchesLeft });
  } catch (error) {
    next(error);
  }
}

/* ─── Búsqueda pública (sin auth) para el hero de Home ──── */
export async function buscarPublico(req, res, next) {
  try {
    const { nombre } = req.query;
    if (!nombre || nombre.trim().length < 2) {
      return res.json({ cromos: [], totalUsuarios: 0 });
    }

    const cromos = await Cromo.find({
      nombre: { $regex: nombre.trim(), $options: 'i' },
    }).select('_id nombre expansion numero categoria rareza imagenUrl').limit(12).lean();

    if (cromos.length === 0) return res.json({ cromos: [], totalUsuarios: 0 });

    const ids = cromos.map(c => c._id);
    const totalUsuarios = await User.countDocuments({
      isActive: true,
      'inventario.repetidos': { $in: ids },
    });

    res.json({ cromos, totalUsuarios });
  } catch (error) {
    next(error);
  }
}

export async function deleteCromo(req, res, next) {
  try {
    await Cromo.findByIdAndDelete(req.params.id);
    res.json({ message: 'Carta eliminada' });
  } catch (error) { next(error); }
}
