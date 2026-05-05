import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createAdminSupabase } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const supabase = createAdminSupabase();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const items = JSON.parse(session.metadata?.order_items || '[]');

      // Determine if any items are physical (need shipping)
      const hasPhysical = items.some((i: any) => i.format === 'physical');

      // Build shipping address from Stripe data
      const shippingAddress = session.shipping_details?.address
        ? {
            line1: session.shipping_details.address.line1,
            line2: session.shipping_details.address.line2,
            city: session.shipping_details.address.city,
            state: session.shipping_details.address.state,
            postal_code: session.shipping_details.address.postal_code,
            country: session.shipping_details.address.country,
          }
        : null;

      // Create order in database
      await supabase.from('orders').insert({
        customer_email: session.customer_details?.email || '',
        customer_name: session.customer_details?.name || '',
        stripe_session_id: session.id,
        stripe_payment_intent_id:
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id,
        items,
        total_cents: session.amount_total || 0,
        status: 'paid',
        shipping_address: shippingAddress,
      });

      // TODO: If digital items, send download link email
      // TODO: If physical items, send order confirmation email

      break;
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('stripe_payment_intent_id', charge.payment_intent);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
