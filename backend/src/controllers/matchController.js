import { findMatchesForUser } from '../services/match.service.js';
import { Match } from '../models/match.model.js';
import { getIO } from '../socket/socket.handler.js';

export async function getMatchesForUser(req, res, next) {
  try {
    const userAId = req.user._id;
    const matches = await findMatchesForUser(userAId);

    if (!matches.length) {
      return res.status(200).json({ message: 'Sin matches por ahora.', matches: [] });
    }

    const persistedMatches = await Promise.all(
      matches.map(m =>
        Match.findOneAndUpdate(
          { userA: userAId, userB: m.userB, status: 'pending' },
          {
            $setOnInsert: {
              userA:          userAId,
              userB:          m.userB,
              cromosDeAparaB: m.cromosDeAparaB,
              cromosDeBparaA: m.cromosDeBparaA,
              ciudad:         req.user.ciudad,
            },
          },
          { upsert: true, new: true }
        )
      )
    );

    const io = getIO();
    for (const match of persistedMatches) {
      io.to(`user:${match.userA}`).emit('new_match', {
        matchId: match._id,
        with:    match.userB,
      });
      io.to(`user:${match.userB}`).emit('new_match', {
        matchId: match._id,
        with:    match.userA,
      });
    }

    res.status(200).json({ matches: persistedMatches });
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
      .populate('cromosDeAparaB', 'numero nombre expansion imagenUrl')
      .populate('cromosDeBparaA', 'numero nombre expansion imagenUrl')
      .sort({ createdAt: -1 });

    res.json({ matches });
  } catch (error) {
    next(error);
  }
}

export async function updateMatchStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const match = await Match.findOneAndUpdate(
      {
        _id: id,
        $or: [{ userA: req.user._id }, { userB: req.user._id }],
      },
      { status },
      { new: true }
    );

    if (!match) return res.status(404).json({ message: 'Match no encontrado' });

    const io = getIO();
    io.to(`user:${match.userA}`).emit('match_updated', { matchId: match._id, status });
    io.to(`user:${match.userB}`).emit('match_updated', { matchId: match._id, status });

    res.json({ match });
  } catch (error) {
    next(error);
  }
}
