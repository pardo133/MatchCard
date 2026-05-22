import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export function initSocket(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin:  process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No autorizado'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    console.log(`Socket conectado: usuario ${socket.userId}`);

    socket.on('disconnect', () => {
      console.log(`Socket desconectado: usuario ${socket.userId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io no inicializado');
  return io;
}
