import Stripe from 'stripe';
import { User } from '../models/user.model.js';

// Inicialización lazy: se crea la instancia la primera vez que se llama un endpoint,
// cuando dotenv ya ha cargado las variables de entorno.
let _stripe = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

/* ─────────────────────────────────────────────────────────────
   POST /api/stripe/checkout
   Crea una sesión de pago de Stripe Checkout y devuelve la URL
   de redirección al frontend.
───────────────────────────────────────────────────────────── */
export async function createCheckout(req, res, next) {
  try {
    const userId = req.user._id.toString();

    // Crear (o reutilizar) el Customer de Stripe para este usuario
    let customerId = req.user.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email:    req.user.email,
        name:     req.user.username,
        metadata: { userId },
      });
      customerId = customer.id;

      // Guardar el ID de cliente en MongoDB para futuras operaciones
      await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
    }

    // Crear la sesión de Checkout en modo suscripción
    const session = await getStripe().checkout.sessions.create({
      customer:            customerId,
      mode:                'subscription',
      payment_method_types: ['card'],

      line_items: [
        {
          price:    process.env.STRIPE_PRICE_ID, // price_1TRK... (del .env)
          quantity: 1,
        },
      ],

      // Metadatos que Stripe nos devolverá en el webhook
      metadata: { userId },

      // URLs de redirección tras el pago
      success_url: `${process.env.CLIENT_URL}/buscador?upgraded=true`,
      cancel_url:  `${process.env.CLIENT_URL}/buscador`,
    });

    // Devolver la URL de la pasarela de Stripe al frontend
    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
}

/* ─────────────────────────────────────────────────────────────
   POST /api/stripe/webhook
   Recibe eventos de Stripe y actúa en consecuencia.
   IMPORTANTE: este endpoint necesita el body en crudo (raw),
   por eso está registrado ANTES de express.json() en app.js.
───────────────────────────────────────────────────────────── */
export async function stripeWebhook(req, res) {
  const sig    = req.headers['stripe-signature'];
  let event;

  try {
    // Verificar la firma del webhook para asegurar que viene de Stripe
    event = getStripe().webhooks.constructEvent(
      req.body,                             // Buffer crudo (raw)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe webhook] Firma inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Procesar los eventos que nos interesan
  switch (event.type) {

    // Pago completado: activar premium
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId  = session.metadata?.userId;

      if (userId) {
        await User.findByIdAndUpdate(userId, { isPremium: true });
        console.log(`[Stripe] Usuario ${userId} → isPremium: true`);
      }
      break;
    }

    // Suscripción cancelada o pago fallido: revocar premium
    case 'customer.subscription.deleted':
    case 'invoice.payment_failed': {
      const obj        = event.data.object;
      const customerId = obj.customer;

      if (customerId) {
        await User.findOneAndUpdate({ stripeCustomerId: customerId }, { isPremium: false });
        console.log(`[Stripe] Customer ${customerId} → isPremium: false`);
      }
      break;
    }

    default:
      // Eventos no relevantes: ignorar silenciosamente
      break;
  }

  // Confirmar recepción a Stripe
  res.json({ received: true });
}
