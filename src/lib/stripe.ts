import Stripe from 'stripe';

// Lazy-initialize Stripe to work in Cloudflare Workers runtime
// (process.env may not be available at module load time)
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      typescript: true,
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return _stripe;
}
