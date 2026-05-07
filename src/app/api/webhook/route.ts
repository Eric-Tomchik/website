import { NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../convex/_generated/api';
import Stripe from 'stripe';

async function sendDownloadEmail(
  email: string,
  name: string,
  bookTitle: string,
  downloadUrl: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set, skipping download email');
    return;
  }

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ArcLight Press <noreply@erictomchik.com>',
        to: email,
        subject: `Your digital copy of "${bookTitle}" is ready!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <h1 style="color: #1a1a2e; margin-bottom: 8px;">Thank you for your purchase!</h1>
            <p style="color: #555; font-size: 16px;">Hi ${name || 'there'},</p>
            <p style="color: #555; font-size: 16px;">
              Your digital copy of <strong>"${bookTitle}"</strong> is ready for download.
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="${downloadUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Download Your Book
              </a>
            </div>
            <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                📥 Available in PDF and EPUB formats<br/>
                ⏰ Link expires in 72 hours<br/>
                🔄 Up to 5 downloads allowed
              </p>
            </div>
            <p style="color: #999; font-size: 13px;">
              If the button doesn't work, copy and paste this link:<br/>
              <a href="${downloadUrl}" style="color: #6366f1;">${downloadUrl}</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 32px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">
              ArcLight Press · erictomchik.com
            </p>
          </div>
        `,
      }),
    });
  } catch (err) {
    console.error('Failed to send download email:', err);
  }
}

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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erictomchik.com';

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
          format: i.format as 'physical' | 'paperback' | 'hardback' | 'digital',
          quantity: i.quantity,
        })),
        total_cents: session.amount_total || 0,
        status: 'paid' as const,
        shipping_address: shippingAddress,
      });

      // Generate download tokens for digital purchases
      const digitalItems = items.filter(
        (i: { format: string }) => i.format === 'digital'
      );

      for (const item of digitalItems) {
        try {
          const { token } = await convex.mutation(
            api.downloadTokens.create,
            {
              book_id: item.book_id,
              customer_email: session.customer_details?.email || '',
              order_id: session.id,
            }
          );

          const downloadUrl = `${siteUrl}/download/${token}`;

          // Send download email
          await sendDownloadEmail(
            session.customer_details?.email || '',
            session.customer_details?.name || '',
            item.book_title || item.title || 'Your Book',
            downloadUrl
          );
        } catch (err) {
          console.error('Failed to create download token:', err);
        }
      }

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
