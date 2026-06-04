import { Match } from '../models/match.model.js';
import { User }  from '../models/user.model.js';
import { Cromo } from '../models/cromo.model.js';
import { getIO }  from '../socket/socket.handler.js';

export async function buscarMatches(req, res, next) {
  try {
    const userId = req.user._id;

    const yo = await User.findById(userId).select('ubicacion ciudad inventario').lean();
    if (!yo) return res.status(404).json({ message: 'Usuario no encontrado' });

    const faltasIds    = yo.inventario.faltas.map(id => id.toString());
    const repetidosIds = yo.inventario.repetidos.map(id => id.toString());

    if (faltasIds.length === 0)
      return res.json({ matches: [], mensaje: 'Añade cartas a tu lista de faltas para encontrar matches.' });

    const tieneUbicacion =
      Array.isArray(yo.ubicacion?.coordinates) &&
      yo.ubicacion.coordinates.length === 2 &&
      (yo.ubicacion.coordinates[0] !== 0 || yo.ubicacion.coordinates[1] !== 0);

    let candidatos;

    if (tieneUbicacion) {
      candidatos = await User.aggregate([
        {
          $geoNear: {
            near:          { type: 'Point', coordinates: yo.ubicacion.coordinates },
            distanceField: 'distanciaMetros',
            spherical:     true,
            maxDistance:   20_000_000,
            query: {
              _id:      { $ne: userId },
              isActive: true,
              'inventario.repetidos': { $in: yo.inventario.faltas },
            },
          },
        },
        {
          $addFields: {
            distanciaKm: { $round: [{ $divide: ['$distanciaMetros', 1000] }, 1] },
            prioridad: {
              $switch: {
                branches: [
                  { case: { $lt: ['$distanciaMetros', 15_000]  }, then: 'zona'        },
                  { case: { $lt: ['$distanciaMetros', 100_000] }, then: 'provincial'  },
                ],
                default: 'internacional',
              },
            },
          },
        },
        { $limit: 60 },
        { $project: { username: 1, ciudad: 1, distanciaKm: 1, prioridad: 1,
                      'inventario.repetidos': 1, 'inventario.faltas': 1 } },
      ]);
    } else {
      const raw = await User.find({
        _id:      { $ne: userId },
        isActive: true,
        'inventario.repetidos': { $in: yo.inventario.faltas },
      }).select('username ciudad inventario').limit(60).lean();

      candidatos = raw.map(c => ({
        ...c,
        distanciaKm: null,
        prioridad: c.ciudad?.toLowerCase() === yo.ciudad?.toLowerCase() ? 'zona' : 'internacional',
      }));
    }

    const matchesEnriquecidos = await Promise.all(
      candidatos.map(async cand => {
        const repCand  = cand.inventario.repetidos.map(id => id.toString());
        const faltCand = cand.inventario.faltas.map(id => id.toString());

        const idsMeDa  = repCand.filter(id => faltasIds.includes(id));
        const idsYoDoy = repetidosIds.filter(id => faltCand.includes(id));

        if (idsMeDa.length === 0) return null;

        const [cartasMeDa, cartasYoDoy] = await Promise.all([
          Cromo.find({ _id: { $in: idsMeDa  } }).select('nombre numero expansion imagenUrl rareza').lean(),
          Cromo.find({ _id: { $in: idsYoDoy } }).select('nombre numero expansion imagenUrl rareza').lean(),
        ]);

        return {
          usuario:         { _id: cand._id, username: cand.username, ciudad: cand.ciudad },
          distanciaKm:     cand.distanciaKm,
          prioridad:       cand.prioridad,
          cartasMeDa,
          cartasYoDoy,
          esBidireccional: idsYoDoy.length > 0,
        };
      })
    );

    const matches = matchesEnriquecidos
      .filter(Boolean)
      .sort((a, b) => {
        if (a.esBidireccional !== b.esBidireccional) return a.esBidireccional ? -1 : 1;
        if (a.distanciaKm !== null && b.distanciaKm !== null) return a.distanciaKm - b.distanciaKm;
        return 0;
      });

    res.json({ matches });
  } catch (error) {
    next(error);
  }
}

export async function proponerMatch(req, res, next) {
  try {
    const { userBId, cromosDeAparaB, cromosDeBparaA, distanciaKm, prioridad } = req.body;
    const userAId = req.user._id;

    const existe = await Match.findOne({
      $or: [
        { userA: userAId, userB: userBId, status: { $in: ['pending', 'accepted'] } },
        { userA: userBId, userB: userAId, status: { $in: ['pending', 'accepted'] } },
      ],
    });
    if (existe) return res.status(409).json({ message: 'Ya existe un match activo con este usuario.', matchId: existe._id });

    const match = await Match.create({
      userA: userAId,
      userB: userBId,
      cromosDeAparaB: cromosDeAparaB || [],
      cromosDeBparaA: cromosDeBparaA || [],
      distanciaKm,
      prioridad: prioridad || 'internacional',
      ciudad:    req.user.ciudad,
    });

    const io = getIO();
    io.to(`user:${userBId}`).emit('nuevo_match_propuesto', {
      matchId:  match._id,
      de:       req.user.username,
      prioridad: match.prioridad,
    });

    res.status(201).json({ match });
  } catch (error) {
    next(error);
  }
}

export async function getMyMatches(req, res, next) {
  try {
    const matches = await Match.find({
      $or: [{ userA: req.user._id }, { userB: req.user._id }],
    })
      .populate('userA', 'username ciudad')
      .populate('userB', 'username ciudad')
      .populate('cromosDeAparaB', 'nombre numero expansion imagenUrl rareza')
      .populate('cromosDeBparaA', 'nombre numero expansion imagenUrl rareza')
      .select('-mensajes')
      .sort({ createdAt: -1 });

    res.json({ matches });
  } catch (error) {
    next(error);
  }
}

export async function updateMatchStatus(req, res, next) {
  try {
    const { id }     = req.params;
    const { status } = req.body;

    const match = await Match.findOneAndUpdate(
      { _id: id, $or: [{ userA: req.user._id }, { userB: req.user._id }] },
      { status },
      { new: true }
    );
    if (!match) return res.status(404).json({ message: 'Match no encontrado' });

    const io = getIO();
    io.to(`user:${match.userA}`).emit('match_actualizado', { matchId: match._id, status });
    io.to(`user:${match.userB}`).emit('match_actualizado', { matchId: match._id, status });

    res.json({ match });
  } catch (error) {
    next(error);
  }
}

export async function getMensajes(req, res, next) {
  try {
    const { id } = req.params;
    const match  = await Match.findById(id)
      .populate('mensajes.autor', 'username')
      .populate('userA', 'username ciudad')
      .populate('userB', 'username ciudad')
      .populate('cromosDeAparaB', 'nombre numero expansion imagenUrl rareza')
      .populate('cromosDeBparaA', 'nombre numero expansion imagenUrl rareza')
      .select('mensajes confirmaciones status userA userB cromosDeAparaB cromosDeBparaA prioridad distanciaKm');

    if (!match) return res.status(404).json({ message: 'Match no encontrado' });

    const esParticipante =
      match.userA._id.toString() === req.user._id.toString() ||
      match.userB._id.toString() === req.user._id.toString();
    if (!esParticipante) return res.status(403).json({ message: 'Acceso denegado' });

    res.json({ match });
  } catch (error) {
    next(error);
  }
}

export async function confirmarIntercambio(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user._id.toString();

    const match = await Match.findById(id);
    if (!match)                          return res.status(404).json({ message: 'Match no encontrado' });
    if (match.status !== 'accepted')     return res.status(400).json({ message: 'El match no está aceptado' });
    if (match.status === 'completed')    return res.status(400).json({ message: 'El intercambio ya se completó' });

    const esA = match.userA.toString() === userId;
    const esB = match.userB.toString() === userId;
    if (!esA && !esB) return res.status(403).json({ message: 'No participas en este match' });

    if (esA) match.confirmaciones.userA = true;
    if (esB) match.confirmaciones.userB = true;
    await match.save();

    const io = getIO();
    io.to(`chat:${id}`).emit('confirmacion_actualizada', {
      matchId:        id,
      confirmaciones: match.confirmaciones,
    });

    if (match.confirmaciones.userA && match.confirmaciones.userB) {
      await ejecutarTransaccion(match);

      io.to(`chat:${id}`).emit('intercambio_completado', { matchId: id });
      io.to(`user:${match.userA}`).emit('inventario_actualizado');
      io.to(`user:${match.userB}`).emit('inventario_actualizado');
    }

    res.json({ confirmaciones: match.confirmaciones, completado: match.status === 'completed' });
  } catch (error) {
    next(error);
  }
}

async function ejecutarTransaccion(match) {
  const { userA, userB, cromosDeAparaB, cromosDeBparaA } = match;

  await User.findByIdAndUpdate(userA, { $pull: { 'inventario.repetidos': { $in: cromosDeAparaB } } });
  await User.findByIdAndUpdate(userB, { $pull: { 'inventario.faltas':    { $in: cromosDeAparaB } } });

  await User.findByIdAndUpdate(userB, { $pull: { 'inventario.repetidos': { $in: cromosDeBparaA } } });
  await User.findByIdAndUpdate(userA, { $pull: { 'inventario.faltas':    { $in: cromosDeBparaA } } });

  match.status = 'completed';
  await match.save();
}
