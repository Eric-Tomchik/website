/**
 * src/app/api/paypal/record-order/route.ts
 *
 * Drop-in replacement for the existing file.
 * Key addition: verifyPayPalOrder() confirms the capture is COMPLETED
 * with PayPal's API before recording the order or issuing a download token.
 *
 * Required new env vars (add to .env.local and deployment):
 *   PAYPAL_CLIENT_ID     — from PayPal Developer Dashboard
 *   PAYPAL_CLIENT_SECRET — from PayPal Developer Dashboard
 *   PAYPAL_ENV           — "sandbox" | "live"  (defaults to "live")
 */

import { NextResponse } from 'next/server';
import { getConvexClient } from '@/lib/convex';
import { api } from '../../../../../convex/_generated/api';
import { z } from 'zod';

// ── PayPal API base URL ───────────────────────────────────────────────────────
function paypalBase(): string {
  const env = process.env.PAYPAL_ENV ?? 'live';
  return env === 'sandbox'
    ? 'https://api-m.sandbox.paypal.com'
    : 'https://api-m.paypal.com';
}

// ── Get a PayPal access token ─────────────────────────────────────────────────
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured (PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET)');
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch(`${paypalBase()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    throw new Error(`PayPal token request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token as string;
}

// ── Verify the order is COMPLETED and return the captured amount ──────────────
interface PayPalOrderVerification {
  status: string;               // e.g. "COMPLETED"
  capturedAmountCents: number;  // what PayPal actually captured
  payerEmail: string;
  captureId: string;
}

async function verifyPayPalOrder(orderId: string): Promise<PayPalOrderVerification> {
  const accessToken = await getPayPalAccessToken();

  const res = await fetch(`${paypalBase()}/v2/checkout/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`PayPal order lookup failed: ${res.status}`);
  }

  const order = await res.json();

  if (order.status !== 'COMPLETED') {
    throw new Error(`PayPal order not completed — status: ${order.status}`);
  }

  // Extract the capture from the first purchase unit
  const capture =
    order.purchase_units?.[0]?.payments?.captures?.[0];

  if (!capture || capture.status !== 'COMPLETED') {
    throw new Error('PayPal capture not found or not completed');
  }

  const capturedAmountCents = Math.round(
    parseFloat(capture.amount?.value ?? '0') * 100
  );

  const payerEmail =
    order.payer?.email_address ?? '';

  return {
    status: order.status,
    capturedAmountCents,
    payerEmail,
    captureId: capture.id,
  };
}

// ── Zod schema ────────────────────────────────────────────────────────────────
const paypalOrderSchema = z.object({
  paypal_order_id: z.string(),
  book_id: z.string(),
  book_title: z.string(),
  format: z.enum(['paperback', 'hardback', 'digital']),
  quantity: z.number().int().min(1).default(1),
  payer_name: z.string(),
  shipping_address: z
    .object({
      address_line_1: z.string().optional(),
      address_line_2: z.string().optional(),
      admin_area_2: z.string().optional(),
      admin_area_1: z.string().optional(),
      postal_code: z.string().optional(),
      country_code: z.string().optional(),
    })
    .optional(),
  discount_code: z.string().optional(),
  // NOTE: payer_email and total_cents are no longer trusted from the client —
  // we get them from PayPal directly.
});

// ── Email helper ──────────────────────────────────────────────────────────────
async function sendDownloadEmail(
  email: string,
  name: string,
  bookTitle: string,
  downloadUrl: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;

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

// ── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = paypalOrderSchema.parse(body);

    // ── Step 1: Verify with PayPal — this is the critical addition ────────────
    let verification: PayPalOrderVerification;
    try {
      verification = await verifyPayPalOrder(data.paypal_order_id);
    } catch (err) {
      console.error('PayPal verification failed:', err);
      return NextResponse.json(
        { error: 'Payment could not be verified. Please contact support.' },
        { status: 402 }
      );
    }

    // ── Step 2: Verify the captured amount matches the expected price ─────────
    const convex = getConvexClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://erictomchik.com';

    try {
      const books = await convex.query(api.books.getByIds, {
        ids: [data.book_id as any],
      });
      const book = books?.[0];

      if (book) {
        const expectedCents =
          data.format === 'digital'
            ? book.digital_price_cents ?? book.price_cents
            : data.format === 'paperback'
              ? book.paperback_price_cents ?? book.price_cents
              : book.price_cents;

        const expectedTotal = expectedCents * data.quantity;

        // Compare what PayPal actually captured vs. what we expect
        if (Math.abs(verification.capturedAmountCents - expectedTotal) > 5) {
          console.error('PayPal amount mismatch', {
            captured: verification.capturedAmountCents,
            expected: expectedTotal,
            orderId: data.paypal_order_id,
          });
          return NextResponse.json(
            { error: 'Payment amount mismatch. Please contact support.' },
            { status: 400 }
          );
        }
      }
    } catch (err) {
      console.error('Price verification warning:', err);
      // Non-fatal — log and continue
    }

    // ── Step 3: Record the order using verified data from PayPal ──────────────
    const shippingAddress = data.shipping_address
      ? {
          line1: data.shipping_address.address_line_1 || undefined,
          line2: data.shipping_address.address_line_2 || undefined,
          city: data.shipping_address.admin_area_2 || undefined,
          state: data.shipping_address.admin_area_1 || undefined,
          postal_code: data.shipping_address.postal_code || undefined,
          country: data.shipping_address.country_code || undefined,
        }
      : undefined;

    await convex.mutation(api.orders.create, {
      adminKey: process.env.CONVEX_AUTH_SECRET!,
      customer_email: verification.payerEmail,         // from PayPal, not client
      customer_name: data.payer_name,
      stripe_session_id: `paypal_${data.paypal_order_id}`,
      stripe_payment_intent_id: `paypal_${verification.captureId}`, // from PayPal
      items: [
        {
          book_id: data.book_id,
          book_title: data.book_title,
          format: data.format,
          quantity: data.quantity,
        },
      ],
      total_cents: verification.capturedAmountCents,   // from PayPal, not client
      status: 'paid' as const,
      shipping_address: shippingAddress,
    });

    // ── Step 4: Issue download token for digital purchases ────────────────────
    if (data.format === 'digital') {
      try {
        const { token } = await convex.mutation(api.downloadTokens.create, {
          adminKey: process.env.CONVEX_AUTH_SECRET!,
          book_id: data.book_id,
          customer_email: verification.payerEmail,
          order_id: `paypal_${data.paypal_order_id}`,
        });

        const downloadUrl = `${siteUrl}/download/${token}`;

        await sendDownloadEmail(
          verification.payerEmail,
          data.payer_name,
          data.book_title,
          downloadUrl
        );

        return NextResponse.json({ success: true, download_url: downloadUrl });
      } catch (err) {
        console.error('Failed to create download token:', err);
      }
    }

    // ── Step 5: Apply discount code if present ────────────────────────────────
    if (data.discount_code) {
      try {
        await convex.mutation(api.discountCodes.apply, { code: data.discount_code });
      } catch (err) {
        console.error('Failed to apply discount code:', err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: err.errors },
        { status: 400 }
      );
    }
    console.error('PayPal record order error:', err);
    const message = err instanceof Error ? err.message : 'Failed to record order';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}