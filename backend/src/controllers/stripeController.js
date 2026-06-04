import Stripe from 'stripe';
import { User } from '../models/user.model.js';

let _stripe = null;
function getStripe() {
  if (!_stripe) _stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return _stripe;
}

export async function createCheckout(req, res, next) {
  try {
    const userId = req.user._id.toString();

    let customerId = req.user.stripeCustomerId;

    if (!customerId) {
      const customer = await getStripe().customers.create({
        email:    req.user.email,
        name:     req.user.username,
        metadata: { userId },
      });
      customerId = customer.id;

      await User.findByIdAndUpdate(userId, { stripeCustomerId: customerId });
    }

    const session = await getStripe().checkout.sessions.create({
      customer:            customerId,
      mode:                'subscription',
      payment_method_types: ['card'],

      line_items: [
        {
          price:    process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],

      metadata: { userId },

      success_url: `${process.env.CLIENT_URL}/buscador?upgraded=true`,
      cancel_url:  `${process.env.CLIENT_URL}/buscador`,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(error);
  }
}

export async function stripeWebhook(req, res) {
  const sig    = req.headers['stripe-signature'];
  let event;

  try {
    event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe webhook] Firma inválida:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {

    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId  = session.metadata?.userId;

      if (userId) {
        await User.findByIdAndUpdate(userId, { isPremium: true });
        console.log(`[Stripe] Usuario ${userId} → isPremium: true`);
      }
      break;
    }

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
      break;
  }

  res.json({ received: true });
}
