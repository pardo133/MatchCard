import express from 'express';
import cors    from 'cors';
import path    from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

import authRoutes   from './routes/auth.routes.js';
import userRoutes   from './routes/user.routes.js';
import matchRoutes  from './routes/match.routes.js';
import cromoRoutes  from './routes/cromo.routes.js';
import adminRoutes  from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import stripeRoutes from './routes/stripe.routes.js';
import { stripeWebhook } from './controllers/stripeController.js';
import { errorHandler }  from './middleware/error.middleware.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors({ origin: process.env.CLIENT_URL }));

// ─── WEBHOOK DE STRIPE ────────────────────────────────────────
// DEBE ir antes de express.json() para recibir el body en crudo
// y poder verificar la firma de Stripe.
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// ─── Resto de rutas (necesitan JSON parseado) ─────────────────
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth',    authRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/cromos',  cromoRoutes);
app.use('/api/admin',   adminRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/stripe',  stripeRoutes);

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;
