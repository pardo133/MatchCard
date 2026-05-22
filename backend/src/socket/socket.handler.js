import { Server } from 'socket.io';
import jwt         from 'jsonwebtoken';
import { User }    from '../models/user.model.js';
import { Match }   from '../models/match.model.js';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL, methods: ['GET', 'POST'] },
  });

  // ── Autenticación en el handshake ──────────────────────────────
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No autorizado'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user    = await User.findById(decoded.id).select('username ciudad');
      if (!user) return next(new Error('Usuario no encontrado'));
      socket.userId   = decoded.id;
      socket.username = user.username;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    // Sala personal del usuario
    socket.join(`user:${socket.userId}`);

    // ── Unirse a sala de chat de un match ──────────────────────
    socket.on('join_chat', ({ matchId }) => {
      socket.join(`chat:${matchId}`);
    });

    // ── Enviar mensaje en el chat ──────────────────────────────
    socket.on('send_message', async ({ matchId, texto }) => {
      if (!texto?.trim() || !matchId) return;

      try {
        const match = await Match.findByIdAndUpdate(
          matchId,
          { $push: { mensajes: { autor: socket.userId, texto: texto.trim() } } },
          { new: true }
        ).populate({ path: 'mensajes', populate: { path: 'autor', select: 'username' } });

        if (!match) return;

        const ultimo = match.mensajes[match.mensajes.length - 1];
        io.to(`chat:${matchId}`).emit('new_message', {
          _id:       ultimo._id,
          texto:     ultimo.texto,
          timestamp: ultimo.timestamp,
          autor:     { _id: socket.userId, username: socket.username },
        });
      } catch (err) {
        socket.emit('socket_error', { message: 'Error enviando mensaje' });
      }
    });

    socket.on('disconnect', () => {});
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
}
