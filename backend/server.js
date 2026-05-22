import http from 'http';
import 'dotenv/config';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';
import { initSocket } from './src/socket/socket.handler.js';

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
initSocket(httpServer);

connectDB().then(() => {
  httpServer.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Puerto ${PORT} ocupado. Ejecuta: lsof -ti :${PORT} | xargs kill -9`);
    } else {
      console.error('Error del servidor:', err.message);
    }
    process.exit(1);
  });
});
