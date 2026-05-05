import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const convex = getConvexClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const items = JSON.parse(session.metadata?.order_items || '[]');

      const shippingAddress = session.shipping_details?.address
        ? {
            line1: session.shipping_details.address.line1 || undefined,
            line2: session.shipping_details.address.line2 || undefined,
            city: session.shipping_details.address.city || undefined,
            state: session.shipping_details.address.state || undefined,
            postal_code: session.shipping_details.address.postal_code || undefined,
            country: session.shipping_details.address.country || undefined,
          }
        : undefined;

      await convex.mutation(api.orders.create, {
        customer_email: session.customer_details?.email || '',
        customer_name: session.customer_details?.name || '',
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
        items: items.map((i: { book_id: string; book_title?: string; title?: string; format: string; quantity: number }) => ({
          book_id: i.book_id,
          book_title: i.book_title || i.title || '',
          format: i.format as 'physical' | 'digital',
          quantity: i.quantity,
        })),
        total_cents: session.amount_total || 0,
        status: 'paid' as const,
        shipping_address: shippingAddress,
      });

      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === 'string'
          ? charge.payment_intent
          : charge.payment_intent?.id;

      if (paymentIntentId) {
        await convex.mutation(api.orders.updateStatusByPaymentIntent, {
          stripe_payment_intent_id: paymentIntentId,
          status: 'refunded',
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
